from rest_framework.renderers import JSONRenderer


class StandardizedJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if isinstance(data, dict) and "success" in data:
            return super().render(data, accepted_media_type, renderer_context)

        if renderer_context and renderer_context.get("response") is not None:
            response = renderer_context["response"]
            if response.status_code >= 400:
                return super().render(data, accepted_media_type, renderer_context)

        wrapped = {"success": True, "data": data}
        return super().render(wrapped, accepted_media_type, renderer_context)
