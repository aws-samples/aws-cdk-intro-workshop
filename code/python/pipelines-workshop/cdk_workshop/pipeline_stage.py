from constructs import Construct
from aws_cdk import Stage
from cdk_workshop.cdk_workshop_stack import CdkWorkshopStack


class WorkshopPipelineStage(Stage):
    @property
    def hc_endpoint(self):
        return self._hc_endpoint

    @property
    def hc_viewer_url(self):
        return self._hc_viewer_url

    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        service = CdkWorkshopStack(self, "WebService")

        self._hc_endpoint = service.hc_endpoint
        self._hc_viewer_url = service.hc_viewer_url
