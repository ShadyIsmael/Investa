# Founder Mobile V2 — Phase 11 Governed Files Report

## Implemented

- Added `FopxGovernedFileUploader` in `fopx_core` for the authenticated
  `POST /api/v1/files/upload` contract. It normalizes category codes, forwards
  project/entity linkage, and rejects malformed responses or a mismatched
  returned category before the owning feature can attach the file.
- Routed Project Room documents, Opportunity covers, and Project logos through
  that shared client. Feature APIs still own purpose, visibility, and record
  attachment; the app does not infer those permissions from upload metadata.
- Added one shared byte-backed Founder file picker and applied it to Project
  Room attachments, funding/loan evidence selection, and the Project logo.
  Project logos/covers remain restricted to the server-supported image types;
  funding/loan proof selection now matches the server's 25 MiB category limit.
- Kept funding and loan evidence on their declaration endpoints because the
  server intentionally rejects standalone `FUNDING_PROOF` uploads. Contract
  files remain server-generated official PDFs. Project Room preview/download
  remains behind the room's authorized endpoints; evidence downloads remain
  behind their domain endpoints.
- No FileStore API-key client was found in the Founder Flutter source. Profile
  has no editable avatar/document upload surface; that belongs to Phase 14.

## Validation

- `flutter test --no-pub`: 108 tests passed.
- `flutter analyze --no-pub`: no issues found after removing the now-obsolete
  private helper left behind when upload parsing moved to the shared uploader.
- Complete Flutter regression suite: 110 tests passed after Phase 12 work was
  added; the Phase 11 project-form/picker flows also passed in isolation.
- Authenticated Development UAT for upload, entity attachment, visibility,
  preview, and download remains deferred per the user's instruction. This is
  not a live UAT pass.

## Follow-up / scope note

- Legacy `/api/v1/investments/{id}/images|videos` endpoints remain in the
  backend for compatibility with other clients. They already route storage
  through the governed backend upload service, but are not called by the
  Founder app; removing or changing them needs an all-client usage check.
- The Phase 7 in-app HTML contract preview remains a known follow-up. Official
  versioned PDF download is available; no HTML renderer was introduced here.
