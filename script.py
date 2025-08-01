#!/usr/bin/env python3
"""
Quick visual explorer for the Postgres dev DB (tyres only, ~30k products, 1 seller, no orders).
Generates PNGs in ./figs and/or shows them interactively.
"""

import os
import argparse
from pathlib import Path
from textwrap import dedent

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sqlalchemy import create_engine
from matplotlib.colors import LogNorm
from dotenv import load_dotenv

# ------------------------- CLI & ENV ------------------------- #
load_dotenv()

def parse_args():
    p = argparse.ArgumentParser(description="Visualize interesting slices of the tyre DB.")
    p.add_argument("--host", default=os.getenv("PGHOST", "localhost"))
    p.add_argument("--db",   default=os.getenv("PGDATABASE", "tyres"))
    p.add_argument("--user", default=os.getenv("PGUSER", "tyres"))
    p.add_argument("--pwd",  default=os.getenv("PGPASSWORD", "tyres"))
    p.add_argument("--port", default=os.getenv("PGPORT", "5432"))
    p.add_argument("--save", action="store_true", help="Save figures to ./figs")
    p.add_argument("--show", action="store_true", help="Show figures interactively")
    p.add_argument("--limit", type=int, default=10000, help="Row limit for heavy queries")
    return p.parse_args()

# ------------------------- SQL ------------------------- #
def build_queries(limit: int) -> dict[str, str]:
    return {
        "Products by Type": """
            SELECT product_type::text AS product_type, COUNT(*) AS cnt
            FROM product
            GROUP BY product_type
            ORDER BY cnt DESC;
        """,
        "Products by Brand": """
            SELECT b.name AS brand, COUNT(*) AS cnt
            FROM product p
            JOIN brand b ON p.brand_id = b.id
            GROUP BY b.name
            ORDER BY cnt DESC
            LIMIT 25;
        """,
        "Missing Core Fields": """
            SELECT 
                COUNT(*) FILTER (WHERE main_image_url IS NULL OR main_image_url = '') AS missing_image,
                COUNT(*) FILTER (WHERE title IS NULL OR title = '') AS missing_title,
                COUNT(*) FILTER (WHERE ean IS NULL OR ean = '') AS missing_ean,
                COUNT(*) AS total
            FROM product;
        """,
        "Active Offer Prices": f"""
            SELECT price_numeric::numeric AS price_numeric
            FROM offer
            WHERE is_active = true
              AND price_numeric IS NOT NULL
            LIMIT {limit};
        """,
        "Stock Distribution": f"""
            SELECT stock
            FROM offer
            WHERE is_active = true
            LIMIT {limit};
        """,
        "Tyre Dimension Frequency": """
            SELECT d.width_mm, d.height_pct, d.rim_diam_in, COUNT(*) AS count
            FROM product_tyres pt
            JOIN dimension d ON pt.dimension_id = d.id
            GROUP BY d.width_mm, d.height_pct, d.rim_diam_in;
        """,
        "Tyres by Season": """
            SELECT s.name AS season, COUNT(*) AS cnt
            FROM product_tyres pt
            JOIN season s ON pt.season_id = s.id
            GROUP BY s.name
            ORDER BY cnt DESC;
        """,
        "EU Label Classes": """
            SELECT eff_class::text AS efficiency,
                   grip_class::text AS grip,
                   eu_noise_db
            FROM product_tyres
            WHERE eff_class IS NOT NULL
               OR grip_class IS NOT NULL
               OR eu_noise_db IS NOT NULL;
        """,
        "Partner Price Delta": """
            SELECT o.price_numeric AS base_price,
                   pp.price_numeric AS partner_price,
                   (o.price_numeric - pp.price_numeric) AS diff
            FROM partner_price pp
            JOIN offer o ON o.id = pp.offer_id
            WHERE o.price_numeric IS NOT NULL
              AND pp.price_numeric IS NOT NULL;
        """,
        "Products Recent Activity": """
            SELECT DATE_TRUNC('month', created_at) AS month,
                   COUNT(*) AS cnt
            FROM product
            GROUP BY 1
            ORDER BY 1;
        """,
    }

# ------------------------- Helpers ------------------------- #
def finalize(fig, name, save, show):
    if save:
        Path("figs").mkdir(exist_ok=True)
        fig.savefig(Path("figs") / f"{name}.png", dpi=180, bbox_inches="tight")
    if show:
        plt.show()
    plt.close(fig)

def safe_read(name, sql, engine):
    try:
        return pd.read_sql(sql, engine)
    except Exception as e:
        print(f"[WARN] {name} failed: {e}")
        return pd.DataFrame()

# ------------------------- Plotting ------------------------- #
def plot_all(dfs: dict[str, pd.DataFrame], save: bool, show: bool):
    sns.set_theme(style="whitegrid")

    # 1. Products by Type (skip if only TYRE)
    if "Products by Type" in dfs and not dfs["Products by Type"].empty:
        df = dfs["Products by Type"]
        if len(df) > 1:
            fig, ax = plt.subplots(figsize=(6,4))
            sns.barplot(data=df, x="product_type", y="cnt", ax=ax)
            ax.set_title("Products by Type")
            ax.set_xlabel("")
            ax.set_ylabel("count")
            for p in ax.patches:
                ax.text(p.get_x()+p.get_width()/2, p.get_height()+50,
                        f"{int(p.get_height()):,}", ha="center", va="bottom", fontsize=8)
            finalize(fig, "01_products_by_type", save, show)
        else:
            # just print count
            print(f"Total products ({df.iloc[0]['product_type']}): {df.iloc[0]['cnt']:,}")

    # 2. Products by Brand
    if "Products by Brand" in dfs and not dfs["Products by Brand"].empty:
        df = dfs["Products by Brand"]
        total = df["cnt"].sum()
        fig, ax = plt.subplots(figsize=(7,6))
        sns.barplot(data=df, y="brand", x="cnt", ax=ax)
        ax.set_title("Top 25 Brands by Product Count")
        ax.set_ylabel("")
        ax.set_xlabel("products")
        for p in ax.patches:
            ax.text(p.get_width()+50, p.get_y()+p.get_height()/2,
                    f"{p.get_width()/total:.1%}", va="center", fontsize=8)
        finalize(fig, "02_products_by_brand", save, show)

    # 3. Price histogram (log)
    if "Active Offer Prices" in dfs and not dfs["Active Offer Prices"].empty:
        prices = dfs["Active Offer Prices"]["price_numeric"]
        fig, ax = plt.subplots(figsize=(6,4))
        sns.histplot(prices, bins=50, log_scale=True, ax=ax)
        p95 = prices.quantile(0.95)
        ax.axvline(p95, ls="--")
        ax.text(p95, ax.get_ylim()[1]*0.9, "95th %", rotation=90, va="top", fontsize=8)
        ax.set_title("Active Offer Price Distribution (log)")
        ax.set_xlabel("price_numeric")
        finalize(fig, "03_offer_price_hist_log", save, show)

    # 4. Stock distribution split
    if "Stock Distribution" in dfs and not dfs["Stock Distribution"].empty:
        stock = dfs["Stock Distribution"]["stock"]
        low = stock[stock <= 20]
        high = stock[stock > 20]

        # 0–20 bar
        fig, ax = plt.subplots(figsize=(6,4))
        vc = low.value_counts().sort_index()
        sns.barplot(x=vc.index, y=vc.values, ax=ax)
        ax.set_title("Stock 0–20 (active offers)")
        ax.set_xlabel("stock")
        ax.set_ylabel("count")
        finalize(fig, "04a_stock_0_20", save, show)

        # >20 hist (log y)
        if not high.empty:
            fig, ax = plt.subplots(figsize=(6,4))
            sns.histplot(high, bins=30, ax=ax)
            ax.set_yscale("log")
            ax.set_title("Stock >20 (log y)")
            ax.set_xlabel("stock")
            finalize(fig, "04b_stock_gt20", save, show)

    # 5. Tyre dimension heatmap
    if "Tyre Dimension Frequency" in dfs and not dfs["Tyre Dimension Frequency"].empty:
        dim_df = dfs["Tyre Dimension Frequency"]
        pivot = dim_df.pivot_table(index="width_mm", columns="rim_diam_in",
                                   values="count", aggfunc="sum").fillna(0)
        # clip to make color differences visible
        vmax = pivot.values.max()
        fig, ax = plt.subplots(figsize=(8,6))
        sns.heatmap(pivot, cmap="Blues", norm=LogNorm(vmin=1, vmax=vmax), ax=ax)
        ax.set_title("Tyre Size Frequency (Width vs Rim Diameter)")
        finalize(fig, "05_tyre_dim_heatmap", save, show)

    # 6. Tyres by Season (%)
    if "Tyres by Season" in dfs and not dfs["Tyres by Season"].empty:
        df = dfs["Tyres by Season"]
        df["pct"] = df["cnt"] / df["cnt"].sum()
        fig, ax = plt.subplots(figsize=(6,4))
        sns.barplot(data=df, x="season", y="pct", ax=ax)
        ax.set_title("Tyre Count by Season (%)")
        ax.set_xlabel("")
        ax.set_ylabel("share")
        ax.yaxis.set_major_formatter(lambda x, pos: f"{x:.0%}")
        finalize(fig, "06_tyre_by_season_pct", save, show)

    # 7. EU label stuff
    if "EU Label Classes" in dfs and not dfs["EU Label Classes"].empty:
        df = dfs["EU Label Classes"]

        # Efficiency vs Grip heatmap
        if df["efficiency"].notna().any() and df["grip"].notna().any():
            pivot = df.pivot_table(index="efficiency", columns="grip",
                                   aggfunc="size", fill_value=0)
            fig, ax = plt.subplots(figsize=(6,5))
            sns.heatmap(pivot, annot=True, fmt="d", cmap="Greens", ax=ax)
            ax.set_title("EU Label: Efficiency vs Grip")
            finalize(fig, "07_eu_label_eff_vs_grip", save, show)

        # Noise histogram
        if df["eu_noise_db"].notna().any():
            fig, ax = plt.subplots(figsize=(6,4))
            sns.histplot(df["eu_noise_db"].dropna(), bins=20, ax=ax)
            ax.set_title("EU Noise (dB) Distribution")
            ax.set_xlabel("eu_noise_db")
            finalize(fig, "08_eu_noise_hist", save, show)

    # 8. Partner price delta
    if "Partner Price Delta" in dfs and not dfs["Partner Price Delta"].empty:
        df = dfs["Partner Price Delta"]
        fig, ax = plt.subplots(figsize=(6,4))
        sns.histplot(df["diff"], bins=30, ax=ax)
        ax.set_title("Partner Price Delta (base - partner)")
        ax.set_xlabel("price difference")
        finalize(fig, "09_partner_price_delta", save, show)

    # 9. Products created per month
    if "Products Recent Activity" in dfs and not dfs["Products Recent Activity"].empty:
        df = dfs["Products Recent Activity"]
        fig, ax = plt.subplots(figsize=(8,4))
        ax.plot(df["month"], df["cnt"], marker="o")
        ax.set_title("Products Created Per Month")
        ax.set_ylabel("count")
        fig.autofmt_xdate()
        finalize(fig, "10_recent_product_activity", save, show)

# ------------------------- Main ------------------------- #
def main():
    args = parse_args()
    engine = create_engine(
        f"postgresql+psycopg2://{args.user}:{args.pwd}@{args.host}:{args.port}/{args.db}"
    )

    queries = build_queries(args.limit)
    dfs = {name: safe_read(name, sql, engine) for name, sql in queries.items()}

    plot_all(dfs, save=args.save, show=args.show)

    if "Missing Core Fields" in dfs and not dfs["Missing Core Fields"].empty:
        m = dfs["Missing Core Fields"].iloc[0]
        pct = lambda x: 100 * x / m["total"] if m["total"] else 0
        print(dedent(f"""
        === Data Quality Snapshot ===
        Total products : {m['total']:,}
        Missing image  : {m['missing_image']:,} ({pct(m['missing_image']):.1f}%)
        Missing title  : {m['missing_title']:,} ({pct(m['missing_title']):.1f}%)
        Missing EAN    : {m['missing_ean']:,} ({pct(m['missing_ean']):.1f}%)
        Figures saved  : ./figs (if --save used)
        """).strip())

if __name__ == "__main__":
    main()
