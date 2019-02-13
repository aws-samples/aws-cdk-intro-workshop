package com.myorg;

import software.amazon.awscdk.App;

public class CdkWorkshop {
    public static void main(final String argv[]) {
        App app = new App();

        new CdkWorkshopStack(app, "CdkWorkshopStack");

        app.run();
    }
}
