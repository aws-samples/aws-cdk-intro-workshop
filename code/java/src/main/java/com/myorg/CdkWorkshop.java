package com.myorg;

import software.amazon.awscdk.core.App;

public class CdkWorkshop {
    public static void main(final String argv[]) {
        App app = new App();

        new CdkWorkshopStack(app, "CdkWorkshopStack");

        app.synth();
    }
}
