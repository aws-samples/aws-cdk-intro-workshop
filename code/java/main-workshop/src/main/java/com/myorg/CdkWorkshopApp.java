package com.myorg;

import software.amazon.awscdk.core.App;

public final class CdkWorkshopApp {
    public static void main(final String[] args) {
        App app = new App();

        new CdkWorkshopStack(app, "CdkWorkshopStack");

        app.synth();
    }
}
