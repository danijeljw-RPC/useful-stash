export const submissionKinds = ['media', 'guest', 'story'] as const;
export type SubmissionKind = typeof submissionKinds[number];
export const submissionStatuses = ['new', 'reviewing', 'contacted', 'shortlisted', 'scheduled', 'declined', 'used', 'archived'] as const;
export type SubmissionStatus = typeof submissionStatuses[number];

export type ValidatedSubmission = Record<string, string | boolean | undefined> & {
  kind: SubmissionKind;
  subtype?: 'story' | 'question';
  contactPermission: boolean;
};

export type StoredSubmission = {
  id: string;
  publicReference: string;
  kind: SubmissionKind;
  subtype: 'story' | 'question' | null;
  status: SubmissionStatus;
  payload: ValidatedSubmission;
  createdAt: string;
  updatedAt: string;
  statusUpdatedBy: string | null;
};

