import { isNil, isString } from '@nestjs/common/utils/shared.utils';

import Handlebars from 'handlebars';

import {
  WorkflowExecutorException,
  WorkflowExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-executor.exception';

const VARIABLE_PATTERN = RegExp('\\{\\{(.*?)\\}\\}', 'g');

export const resolveInput = (
  unresolvedInput: unknown,
  context: Record<string, unknown>,
): unknown => {
  if (isNil(unresolvedInput)) {
    return unresolvedInput;
  }

  if (isString(unresolvedInput)) {
    return resolveString(unresolvedInput, context);
  }

  if (Array.isArray(unresolvedInput)) {
    return resolveArray(unresolvedInput, context);
  }

  if (typeof unresolvedInput === 'object' && unresolvedInput !== null) {
    return resolveObject(unresolvedInput, context);
  }

  return unresolvedInput;
};

const resolveArray = (
  input: unknown[],
  context: Record<string, unknown>,
): unknown[] => {
  const resolvedArray = input;

  for (let i = 0; i < input.length; ++i) {
    resolvedArray[i] = resolveInput(input[i], context);
  }

  return resolvedArray;
};

const resolveObject = (
  input: object,
  context: Record<string, unknown>,
): object => {
  const resolvedObject = input;

  const entries = Object.entries(resolvedObject);

  for (const [key, value] of entries) {
    resolvedObject[key] = resolveInput(value, context);
  }

  return resolvedObject;
};

const resolveString = (
  input: string,
  context: Record<string, unknown>,
): string => {
  const matchedTokens = input.match(VARIABLE_PATTERN);

  if (!matchedTokens || matchedTokens.length === 0) {
    return input;
  }

  if (matchedTokens.length === 1 && matchedTokens[0] === input) {
    return evalFromContext(input, context);
  }

  return input.replace(VARIABLE_PATTERN, (matchedToken, _) => {
    const processedToken = evalFromContext(matchedToken, context);

    return processedToken;
  });
};

const evalFromContext = (
  input: string,
  context: Record<string, unknown>,
): string => {
  try {
    const inferredInput = Handlebars.compile(input)(context);

    return inferredInput ?? '';
  } catch (exception) {
    throw new WorkflowExecutorException(
      `Failed to evaluate variable ${input}: ${exception}`,
      WorkflowExecutorExceptionCode.VARIABLE_EVALUATION_FAILED,
    );
  }
};
