type BaseWorkflowStepSettings = {
  errorHandlingOptions: {
    retryOnFailure: {
      value: boolean;
    };
    continueOnFailure: {
      value: boolean;
    };
  };
};

export type WorkflowCodeStepSettings = BaseWorkflowStepSettings & {
  input: {
    serverlessFunctionId: string;
  };
};

export type WorkflowSendEmailStepSettings = BaseWorkflowStepSettings & {
  input: {
    connectedAccountId: string;
    email: string;
    subject?: string;
    body?: string;
  };
};

type BaseWorkflowStep = {
  id: string;
  name: string;
  valid: boolean;
};

export type WorkflowCodeStep = BaseWorkflowStep & {
  type: 'CODE';
  settings: WorkflowCodeStepSettings;
};

export type WorkflowSendEmailStep = BaseWorkflowStep & {
  type: 'SEND_EMAIL';
  settings: WorkflowSendEmailStepSettings;
};

export type WorkflowAction = WorkflowCodeStep | WorkflowSendEmailStep;

export type WorkflowStep = WorkflowAction;

export type WorkflowActionType = WorkflowAction['type'];

export type WorkflowStepType = WorkflowStep['type'];

type BaseTrigger = {
  type: string;
  input?: object;
};

export type WorkflowDatabaseEventTrigger = BaseTrigger & {
  type: 'DATABASE_EVENT';
  settings: {
    eventName: string;
  };
};

export type WorkflowManualTrigger = BaseTrigger & {
  type: 'MANUAL';
  settings: {
    objectType?: string;
  };
};

export type WorkflowManualTriggerSettings = WorkflowManualTrigger['settings'];

export type WorkflowManualTriggerAvailability =
  | 'EVERYWHERE'
  | 'WHEN_RECORD_SELECTED';

export type WorkflowTrigger =
  | WorkflowDatabaseEventTrigger
  | WorkflowManualTrigger;

export type WorkflowTriggerType = WorkflowTrigger['type'];

export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'DEACTIVATED';

export type WorkflowVersionStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DEACTIVATED'
  | 'ARCHIVED';

export type WorkflowVersion = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  workflowId: string;
  trigger: WorkflowTrigger | null;
  steps: Array<WorkflowStep> | null;
  status: WorkflowVersionStatus;
  __typename: 'WorkflowVersion';
};

type StepRunOutput = {
  id: string;
  name: string;
  type: string;
  outputs: {
    attemptCount: number;
    result: object | undefined;
    error: string | undefined;
  }[];
};

export type WorkflowRunOutput = {
  steps: Record<string, StepRunOutput>;
};

export type WorkflowRun = {
  __typename: 'WorkflowRun';
  id: string;
  workflowVersionId: string;
  output: WorkflowRunOutput;
};

export type Workflow = {
  __typename: 'Workflow';
  id: string;
  name: string;
  versions: Array<WorkflowVersion>;
  lastPublishedVersionId: string;
  statuses: Array<WorkflowStatus> | null;
};

export type WorkflowWithCurrentVersion = Workflow & {
  currentVersion: WorkflowVersion;
};
