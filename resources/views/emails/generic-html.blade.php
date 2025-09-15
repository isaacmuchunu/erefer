<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $emailMessage->subject }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }
        .footer {
            margin-top: 20px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            font-size: 12px;
            color: #6c757d;
            text-align: center;
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <h1>CareLink</h1>
            <p>Healthcare Communication System</p>
        </div>
    </div>

    <div class="content">
        {!! $bodyHtml !!}
    </div>

    <div class="footer">
        <p>This email was sent from CareLink Healthcare Communication System.</p>
        <p>If you received this email in error, please contact your system administrator.</p>
        @if($emailMessage->referral_id)
            <p>Reference: REF-{{ $emailMessage->referral_id }}</p>
        @endif
    </div>
</body>
</html>
