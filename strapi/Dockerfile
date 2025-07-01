#################  Build  #################
FROM node:20-alpine AS build
ARG CMS_DIR=strapi
WORKDIR /app

# 1️⃣ copy workspace manifests + lock
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY ${CMS_DIR}/package.json ./${CMS_DIR}/

# 2️⃣ install EVERYTHING (skip Husky)
ENV HUSKY=0
RUN corepack enable \
 && corepack prepare pnpm@10.12.4 --activate \
 && pnpm install --frozen-lockfile

# 3️⃣ copy Strapi source *after* deps and build admin
COPY ${CMS_DIR}/ ./${CMS_DIR}/
WORKDIR /app/${CMS_DIR}
RUN pnpm add @strapi/admin  # Ensure admin is installed
RUN pnpm build            # CLI now present

# 4️⃣ OPTIONAL – strip dev-deps
RUN pnpm prune --prod

#################  Runtime ###############
FROM node:20-alpine
WORKDIR /app
RUN corepack enable \
 && corepack prepare pnpm@10.12.4 --activate 
ENV NODE_ENV=production

COPY --from=build /app/${CMS_DIR} ./

EXPOSE 1337
CMD ["pnpm","start"]
