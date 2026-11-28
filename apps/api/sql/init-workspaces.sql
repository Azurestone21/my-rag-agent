-- 1. 创建 Workspaces 表
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type INTEGER NOT NULL DEFAULT 1, --  1:personal, 2:team
  "ownerId" integer REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE workspaces IS '工作空间表（个人或团队）';
COMMENT ON COLUMN workspaces.id IS '工作空间ID（UUID）';
COMMENT ON COLUMN workspaces.name IS '工作空间名称';
COMMENT ON COLUMN workspaces.type IS '空间类型：1:personal(个人), 2:team(团队)';
COMMENT ON COLUMN workspaces."ownerId" IS '拥有者ID（关联users表）';
COMMENT ON COLUMN workspaces."createdAt" IS '创建时间';
COMMENT ON COLUMN workspaces."updatedAt" IS '更新时间';

-- 2. 创建 Workspace Members 表（决定谁能访问哪个空间）
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspaceId" UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  "userId" integer REFERENCES users(id) ON DELETE CASCADE,
  role INTEGER NOT NULL DEFAULT 3, -- 1:owner, 2:admin, 3:member
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE("workspaceId", "userId") -- 防止重复加入
);

COMMENT ON TABLE workspace_members IS '工作空间成员关联表';
COMMENT ON COLUMN workspace_members.id IS '成员记录ID（UUID）';
COMMENT ON COLUMN workspace_members."workspaceId" IS '所属工作空间ID（UUID）';
COMMENT ON COLUMN workspace_members."userId" IS '用户ID（关联users表）';
COMMENT ON COLUMN workspace_members.role IS '空间内角色：1:owner(拥有者), 2:admin(管理员), 3:member(普通成员)';
COMMENT ON COLUMN workspace_members."createdAt" IS '加入时间';

-- 3. 给 knowledge_bases 换成 workspaceId
ALTER TABLE knowledge_bases ADD COLUMN "workspaceId" UUID;
COMMENT ON COLUMN knowledge_bases."workspaceId" IS '所属工作空间ID（关联workspaces表）';

-- 4. 数据迁移：如果你的知识库表里已经有数据，先创建一个默认空间并把数据挂过去
-- (如果你表里是空的，这步直接跳过；如果有数据，先建个默认用户空间)
INSERT INTO workspaces (name, type, "ownerId") VALUES ('默认空间', 1, 2);
UPDATE knowledge_bases SET "workspaceId" = 插入数据的空间ID WHERE "workspaceId" IS NULL;

-- 5. 设置非空和外键
ALTER TABLE knowledge_bases ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE knowledge_bases 
ADD CONSTRAINT fk_workspace 
FOREIGN KEY ("workspaceId") 
REFERENCES workspaces(id) 
ON DELETE CASCADE;


-- 6. 创建索引
CREATE INDEX idx_kb_workspaceId ON knowledge_bases("workspaceId");