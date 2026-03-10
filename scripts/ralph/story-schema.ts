export type StoryCategory = 'functional' | 'edge-case' | 'integration' | 'ui';
export type StoryStage = 'planned' | 'visual-done' | 'data-wired' | 'tests-passed' | 'rebuilt';
export type RouteType = 'overview' | 'list' | 'detail' | 'new' | 'other';

export type BaseStory = {
  id: string;
  scope: 'meta' | 'route';
  stage: StoryStage;
  description: string;
  steps: string[];
  passes: boolean;
  category?: StoryCategory;
  notes?: string;
};

export type MetaStory = BaseStory & {
  scope: 'meta';
};

export type RouteStory = BaseStory & {
  scope: 'route';
  route: string;
  routeType: RouteType;
  family: 'T1' | 'T2' | 'T3' | 'T4';
  designNodeId: string;
  expectedRuntime: string;
  dataSource?: string;
  dependsOn?: string[];
};

export type UserStory = MetaStory | RouteStory;

function validateBaseStory(story: Partial<UserStory>, prefix: string): string[] {
  const errors: string[] = [];

  if (typeof story.id !== 'string' || story.id.trim().length === 0) {
    errors.push(`${prefix}: id 必须是非空字符串`);
  }

  if (story.scope !== 'meta' && story.scope !== 'route') {
    errors.push(`${prefix}: scope 仅允许 meta / route`);
  }

  if (
    story.stage !== 'planned' &&
    story.stage !== 'visual-done' &&
    story.stage !== 'data-wired' &&
    story.stage !== 'tests-passed' &&
    story.stage !== 'rebuilt'
  ) {
    errors.push(`${prefix}: stage 仅允许 planned / visual-done / data-wired / tests-passed / rebuilt`);
  }

  if (typeof story.description !== 'string' || story.description.trim().length === 0) {
    errors.push(`${prefix}: description 必须是非空字符串`);
  }

  if (!Array.isArray(story.steps) || story.steps.length === 0) {
    errors.push(`${prefix}: steps 必须是至少包含一项的字符串数组`);
  } else if (story.steps.some((step) => typeof step !== 'string' || step.trim().length === 0)) {
    errors.push(`${prefix}: steps 中每一项都必须是非空字符串`);
  }

  if (typeof story.passes !== 'boolean') {
    errors.push(`${prefix}: passes 必须是布尔值`);
  }

  if (
    story.category !== undefined &&
    story.category !== 'functional' &&
    story.category !== 'edge-case' &&
    story.category !== 'integration' &&
    story.category !== 'ui'
  ) {
    errors.push(`${prefix}: category 仅允许 functional / edge-case / integration / ui`);
  }

  return errors;
}

function validateRouteStory(story: Partial<RouteStory>, prefix: string): string[] {
  const errors: string[] = [];

  if (typeof story.route !== 'string' || story.route.trim().length === 0) {
    errors.push(`${prefix}: route story 必须提供 route`);
  }

  if (
    story.routeType !== 'overview' &&
    story.routeType !== 'list' &&
    story.routeType !== 'detail' &&
    story.routeType !== 'new' &&
    story.routeType !== 'other'
  ) {
    errors.push(`${prefix}: route story 必须提供 routeType`);
  }

  if (story.family !== 'T1' && story.family !== 'T2' && story.family !== 'T3' && story.family !== 'T4') {
    errors.push(`${prefix}: route story 必须提供 family`);
  }

  if (typeof story.designNodeId !== 'string' || story.designNodeId.trim().length === 0) {
    errors.push(`${prefix}: route story 必须提供 designNodeId`);
  }

  if (typeof story.expectedRuntime !== 'string' || story.expectedRuntime.trim().length === 0) {
    errors.push(`${prefix}: route story 必须提供 expectedRuntime`);
  }

  if (story.passes === true && story.stage !== 'rebuilt') {
    errors.push(`${prefix}: 只有 stage=rebuilt 的 route story 才能标记 passes=true`);
  }

  return errors;
}

export function validateStoryDocument(stories: unknown, filePath: string): string[] {
  if (!Array.isArray(stories) || stories.length === 0) {
    return [`${filePath}: 顶层必须是至少包含一项的数组`];
  }

  const errors: string[] = [];

  stories.forEach((story, index) => {
    const prefix = `${filePath}#${index}`;

    if (typeof story !== 'object' || story === null) {
      errors.push(`${prefix}: story 必须是对象`);
      return;
    }

    const candidate = story as Partial<UserStory>;
    errors.push(...validateBaseStory(candidate, prefix));

    if (candidate.scope === 'route') {
      errors.push(...validateRouteStory(candidate as Partial<RouteStory>, prefix));
    }
  });

  return errors;
}
