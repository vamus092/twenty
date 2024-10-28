import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { SignInUpForm } from '@/auth/sign-in-up/components/SignInUpForm';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { useWorkspaceFromInviteHash } from '@/auth/sign-in-up/hooks/useWorkspaceFromInviteHash';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useWorkspaceSwitching } from '@/ui/navigation/navigation-drawer/hooks/useWorkspaceSwitching';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AnimatedEaseIn, Loader, MainButton } from 'twenty-ui';
import {
  useAddUserToWorkspaceByInviteTokenMutation,
  useAddUserToWorkspaceMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const Invite = () => {
  const { workspace: workspaceFromInviteHash, workspaceInviteHash } =
    useWorkspaceFromInviteHash();

  const { form } = useSignInUpForm();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const [addUserToWorkspace] = useAddUserToWorkspaceMutation();
  const [addUserToWorkspaceByInviteToken] =
    useAddUserToWorkspaceByInviteTokenMutation();
  const { switchWorkspace } = useWorkspaceSwitching();
  const [searchParams] = useSearchParams();
  const workspaceInviteToken = searchParams.get('inviteToken');

  const title = useMemo(() => {
    return `Join ${workspaceFromInviteHash?.displayName ?? ''} team`;
  }, [workspaceFromInviteHash?.displayName]);

  const handleUserJoinWorkspace = async () => {
    if (isDefined(workspaceInviteToken) && isDefined(workspaceFromInviteHash)) {
      await addUserToWorkspaceByInviteToken({
        variables: {
          inviteToken: workspaceInviteToken,
        },
      });
    } else if (
      isDefined(workspaceInviteHash) &&
      isDefined(workspaceFromInviteHash)
    ) {
      await addUserToWorkspace({
        variables: {
          inviteHash: workspaceInviteHash,
        },
      });
    } else {
      return;
    }

    await switchWorkspace(workspaceFromInviteHash.id);
  };

  if (
    !isDefined(workspaceFromInviteHash) ||
    (isDefined(workspaceFromInviteHash) &&
      isDefined(currentWorkspace) &&
      workspaceFromInviteHash.id === currentWorkspace.id)
  ) {
    return <></>;
  }

  return (
    <>
      <AnimatedEaseIn>
        <Logo workspaceLogo={workspaceFromInviteHash?.logo} />
      </AnimatedEaseIn>
      <Title animate>{title}</Title>
      {isDefined(currentWorkspace) ? (
        <>
          <StyledContentContainer>
            <MainButton
              title="Continue"
              type="submit"
              onClick={handleUserJoinWorkspace}
              Icon={() => form.formState.isSubmitting && <Loader />}
              fullWidth
            />
          </StyledContentContainer>
          <FooterNote />
        </>
      ) : (
        <SignInUpForm />
      )}
    </>
  );
};
