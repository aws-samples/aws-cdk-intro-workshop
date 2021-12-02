package com.myorg;

import software.amazon.awscdk.App;

public final class CdkWorkshopApp {
    public static void main(final String[] args) {
        App app = new App();

        new WorkshopPipelineStack(app, "PipelineStack");

        app.synth();
    }
}
