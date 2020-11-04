from aws_cdk import (
    core
)
from pypipworkshop_stack import PypipworkshopStack

class WorkshopPipelineStage(core.Stage):

    @property
    def hc_endpoint(self):
        return self._hc_endpoint

    @property
    def hc_viewer_url(self):
        return self._hc_viewer_url

    def __init__(self, scope: core.Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        service = PypipworkshopStack(self, 'WebService')

        self._hc_enpdoint = service.hc_endpoint
        self._hc_viewer_url = service.hc_viewer_url
