CareLink - Healthcare Communication System
==========================================

{{ $bodyText ?? strip_tags($bodyHtml) }}

---
This email was sent from CareLink Healthcare Communication System.
If you received this email in error, please contact your system administrator.

@if($emailMessage->referral_id)
Reference: REF-{{ $emailMessage->referral_id }}
@endif
