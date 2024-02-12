# -*- coding: utf-8 -*-
# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from __future__ import annotations

from typing import MutableMapping, MutableSequence

import proto  # type: ignore

from google.protobuf import timestamp_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.apigateway.v1',
    manifest={
        'Api',
        'ApiConfig',
        'Gateway',
        'GatewayEventData',
        'ApiConfigEventData',
        'ApiEventData',
    },
)


class Api(proto.Message):
    r"""An API that can be served by one or more Gateways.

    Attributes:
        name (str):
            Output only. Resource name of the API.
            Format:
            projects/{project}/locations/global/apis/{api}
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Created time.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Updated time.
        labels (MutableMapping[str, str]):
            Optional. Resource labels to represent
            user-provided metadata. Refer to cloud
            documentation on labels for more details.
            https://cloud.google.com/compute/docs/labeling-resources
        display_name (str):
            Optional. Display name.
        managed_service (str):
            Optional. Immutable. The name of a Google
            Managed Service (
            https://cloud.google.com/service-infrastructure/docs/glossary#managed).
            If not specified, a new Service will
            automatically be created in the same project as
            this API.
        state (google.events.cloud.apigateway_v1.types.Api.State):
            Output only. State of the API.
    """
    class State(proto.Enum):
        r"""All the possible API states.

        Values:
            STATE_UNSPECIFIED (0):
                API does not have a state yet.
            CREATING (1):
                API is being created.
            ACTIVE (2):
                API is active.
            FAILED (3):
                API creation failed.
            DELETING (4):
                API is being deleted.
            UPDATING (5):
                API is being updated.
        """
        STATE_UNSPECIFIED = 0
        CREATING = 1
        ACTIVE = 2
        FAILED = 3
        DELETING = 4
        UPDATING = 5

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=5,
    )
    managed_service: str = proto.Field(
        proto.STRING,
        number=7,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=12,
        enum=State,
    )


class ApiConfig(proto.Message):
    r"""An API Configuration is a combination of settings for both
    the Managed Service and Gateways serving this API Config.

    Attributes:
        name (str):
            Output only. Resource name of the API Config. Format:
            projects/{project}/locations/global/apis/{api}/configs/{api_config}
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Created time.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Updated time.
        labels (MutableMapping[str, str]):
            Optional. Resource labels to represent
            user-provided metadata. Refer to cloud
            documentation on labels for more details.
            https://cloud.google.com/compute/docs/labeling-resources
        display_name (str):
            Optional. Display name.
        gateway_service_account (str):
            Immutable. The Google Cloud IAM Service Account that
            Gateways serving this config should use to authenticate to
            other services. This may either be the Service Account's
            email (``{ACCOUNT_ID}@{PROJECT}.iam.gserviceaccount.com``)
            or its full resource name
            (``projects/{PROJECT}/accounts/{UNIQUE_ID}``). This is most
            often used when the service is a GCP resource such as a
            Cloud Run Service or an IAP-secured service.
        service_config_id (str):
            Output only. The ID of the associated Service
            Config (
            https://cloud.google.com/service-infrastructure/docs/glossary#config).
        state (google.events.cloud.apigateway_v1.types.ApiConfig.State):
            Output only. State of the API Config.
        openapi_documents (MutableSequence[google.events.cloud.apigateway_v1.types.ApiConfig.OpenApiDocument]):
            Optional. OpenAPI specification documents. If specified,
            grpc_services and managed_service_configs must not be
            included.
        grpc_services (MutableSequence[google.events.cloud.apigateway_v1.types.ApiConfig.GrpcServiceDefinition]):
            Optional. gRPC service definition files. If specified,
            openapi_documents must not be included.
        managed_service_configs (MutableSequence[google.events.cloud.apigateway_v1.types.ApiConfig.File]):
            Optional. Service Configuration files. At least one must be
            included when using gRPC service definitions. See
            https://cloud.google.com/endpoints/docs/grpc/grpc-service-config#service_configuration_overview
            for the expected file contents.

            If multiple files are specified, the files are merged with
            the following rules:

            -  All singular scalar fields are merged using "last one
               wins" semantics in the order of the files uploaded.
            -  Repeated fields are concatenated.
            -  Singular embedded messages are merged using these rules
               for nested fields.
    """
    class State(proto.Enum):
        r"""All the possible API Config states.

        Values:
            STATE_UNSPECIFIED (0):
                API Config does not have a state yet.
            CREATING (1):
                API Config is being created and deployed to
                the API Controller.
            ACTIVE (2):
                API Config is ready for use by Gateways.
            FAILED (3):
                API Config creation failed.
            DELETING (4):
                API Config is being deleted.
            UPDATING (5):
                API Config is being updated.
            ACTIVATING (6):
                API Config settings are being activated in
                downstream systems. API Configs in this state
                cannot be used by Gateways.
        """
        STATE_UNSPECIFIED = 0
        CREATING = 1
        ACTIVE = 2
        FAILED = 3
        DELETING = 4
        UPDATING = 5
        ACTIVATING = 6

    class File(proto.Message):
        r"""A lightweight description of a file.

        Attributes:
            path (str):
                The file path (full or relative path). This
                is typically the path of the file when it is
                uploaded.
            contents (bytes):
                The bytes that constitute the file.
        """

        path: str = proto.Field(
            proto.STRING,
            number=1,
        )
        contents: bytes = proto.Field(
            proto.BYTES,
            number=2,
        )

    class OpenApiDocument(proto.Message):
        r"""An OpenAPI Specification Document describing an API.

        Attributes:
            document (google.events.cloud.apigateway_v1.types.ApiConfig.File):
                The OpenAPI Specification document file.
        """

        document: 'ApiConfig.File' = proto.Field(
            proto.MESSAGE,
            number=1,
            message='ApiConfig.File',
        )

    class GrpcServiceDefinition(proto.Message):
        r"""A gRPC service definition.

        Attributes:
            source (MutableSequence[google.events.cloud.apigateway_v1.types.ApiConfig.File]):
                Optional. Uncompiled proto files associated with the
                descriptor set, used for display purposes (server-side
                compilation is not supported). These should match the inputs
                to 'protoc' command used to generate file_descriptor_set.
        """

        source: MutableSequence['ApiConfig.File'] = proto.RepeatedField(
            proto.MESSAGE,
            number=2,
            message='ApiConfig.File',
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=5,
    )
    gateway_service_account: str = proto.Field(
        proto.STRING,
        number=14,
    )
    service_config_id: str = proto.Field(
        proto.STRING,
        number=12,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=8,
        enum=State,
    )
    openapi_documents: MutableSequence[OpenApiDocument] = proto.RepeatedField(
        proto.MESSAGE,
        number=9,
        message=OpenApiDocument,
    )
    grpc_services: MutableSequence[GrpcServiceDefinition] = proto.RepeatedField(
        proto.MESSAGE,
        number=10,
        message=GrpcServiceDefinition,
    )
    managed_service_configs: MutableSequence[File] = proto.RepeatedField(
        proto.MESSAGE,
        number=11,
        message=File,
    )


class Gateway(proto.Message):
    r"""A Gateway is an API-aware HTTP proxy. It performs API-Method
    and/or API-Consumer specific actions based on an API Config such
    as authentication, policy enforcement, and backend selection.

    Attributes:
        name (str):
            Output only. Resource name of the Gateway.
            Format:
            projects/{project}/locations/{location}/gateways/{gateway}
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Created time.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Updated time.
        labels (MutableMapping[str, str]):
            Optional. Resource labels to represent
            user-provided metadata. Refer to cloud
            documentation on labels for more details.
            https://cloud.google.com/compute/docs/labeling-resources
        display_name (str):
            Optional. Display name.
        api_config (str):
            Required. Resource name of the API Config for
            this Gateway. Format:
            projects/{project}/locations/global/apis/{api}/configs/{apiConfig}
        state (google.events.cloud.apigateway_v1.types.Gateway.State):
            Output only. The current state of the
            Gateway.
        default_hostname (str):
            Output only. The default API Gateway host name of the form
            ``{gateway_id}-{hash}.{region_code}.gateway.dev``.
    """
    class State(proto.Enum):
        r"""All the possible Gateway states.

        Values:
            STATE_UNSPECIFIED (0):
                Gateway does not have a state yet.
            CREATING (1):
                Gateway is being created.
            ACTIVE (2):
                Gateway is running and ready for requests.
            FAILED (3):
                Gateway creation failed.
            DELETING (4):
                Gateway is being deleted.
            UPDATING (5):
                Gateway is being updated.
        """
        STATE_UNSPECIFIED = 0
        CREATING = 1
        ACTIVE = 2
        FAILED = 3
        DELETING = 4
        UPDATING = 5

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=5,
    )
    api_config: str = proto.Field(
        proto.STRING,
        number=6,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=7,
        enum=State,
    )
    default_hostname: str = proto.Field(
        proto.STRING,
        number=9,
    )


class GatewayEventData(proto.Message):
    r"""The data within all Gateway events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.apigateway_v1.types.Gateway):
            Optional. The Gateway event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Gateway' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Gateway',
    )


class ApiConfigEventData(proto.Message):
    r"""The data within all ApiConfig events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.apigateway_v1.types.ApiConfig):
            Optional. The ApiConfig event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'ApiConfig' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='ApiConfig',
    )


class ApiEventData(proto.Message):
    r"""The data within all Api events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.apigateway_v1.types.Api):
            Optional. The Api event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Api' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Api',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
