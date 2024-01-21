import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Root({children}) {
  const {
    siteConfig: {customFields},
  } = useDocusaurusContext();

  // Handle auto download on trial page
  if (location.pathname.startsWith("/") && location.pathname.endsWith("-trial") ) {

    // Convert "/hello-trial" to "helloUrl"
    var path = location.pathname.replace(/^\//, '');
    var firstPart = path.split('-')[0];
    var pathVariable = firstPart + 'Url';
    var downloadUrl = customFields.products[pathVariable];

    if (!downloadUrl) {
        return <div>Download URL not found</div>;
    }
    return (
        <>
            <Head>
                <meta
                http-equiv="refresh"
                content={`0; url=${downloadUrl}`}
                />
            </Head>
          {children}
        </>
    );
  }

  return <>{children}</>;
}
