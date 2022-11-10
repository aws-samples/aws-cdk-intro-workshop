document.onreadystatechange = function () {
  if (document.readyState === "interactive") {
    new CookiesEuBanner(function () {
      console.log("Tracking accepted.");
      (function(n,i,v,r,s,c,x,z){x=window.AwsRumClient={q:[],n:n,i:i,v:v,r:r,c:c};window[n]=function(c,p){x.q.push({c:c,p:p});};z=document.createElement('script');z.async=true;z.src=s;document.head.insertBefore(z,document.head.getElementsByTagName('script')[0]);})(
        'cwr',
        '0b414b66-2dbf-4e8d-9940-7c207944d904',
        '1.0.0',
        'us-west-2',
        'https://client.rum.us-east-1.amazonaws.com/1.10.0/cwr.js',
        {
          sessionSampleRate: 1,
          guestRoleArn: "arn:aws:iam::025656461920:role/RUM-Monitor-us-west-2-025656461920-1150549308661-Unauth",
          identityPoolId: "us-west-2:b1fc90ca-7459-423d-8eae-17d05062c2fa",
          endpoint: "https://dataplane.rum.us-west-2.amazonaws.com",
          telemetries: ["performance"],
          allowCookies: true,
          enableXRay: false
        }
      );    
    }, true);
  }
};