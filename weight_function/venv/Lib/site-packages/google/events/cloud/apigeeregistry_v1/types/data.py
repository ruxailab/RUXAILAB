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
    package='google.events.cloud.apigeeregistry.v1',
    manifest={
        'Instance',
        'Api',
        'ApiVersion',
        'ApiSpec',
        'ApiDeployment',
        'ApiVersionEventData',
        'InstanceEventData',
        'ApiSpecEventData',
        'ApiDeploymentEventData',
        'ApiEventData',
    },
)


class Instance(proto.Message):
    r"""An Instance represents the instance resources of the
    Registry. Currently, only one instance is allowed for each
    project.

    Attributes:
        name (str):
            Format: ``projects/*/locations/*/instance``. Currently only
            ``locations/global`` is supported.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Creation timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Last update timestamp.
        state (google.events.cloud.apigeeregistry_v1.types.Instance.State):
            Output only. The current state of the
            Instance.
        state_message (str):
            Output only. Extra information of Instance.State if the
            state is ``FAILED``.
        config (google.events.cloud.apigeeregistry_v1.types.Instance.Config):
            Required. Config of the Instance.
    """
    class State(proto.Enum):
        r"""State of the Instance.

        Values:
            STATE_UNSPECIFIED (0):
                The default value. This value is used if the
                state is omitted.
            INACTIVE (1):
                The Instance has not been initialized or has
                been deleted.
            CREATING (2):
                The Instance is being created.
            ACTIVE (3):
                The Instance has been created and is ready
                for use.
            UPDATING (4):
                The Instance is being updated.
            DELETING (5):
                The Instance is being deleted.
            FAILED (6):
                The Instance encountered an error during a
                state change.
        """
        STATE_UNSPECIFIED = 0
        INACTIVE = 1
        CREATING = 2
        ACTIVE = 3
        UPDATING = 4
        DELETING = 5
        FAILED = 6

    class Config(proto.Message):
        r"""Available configurations to provision an Instance.

        Attributes:
            location (str):
                Output only. The GCP location where the
                Instance resides.
            cmek_key_name (str):
                Required. The Customer Managed Encryption Key (CMEK) used
                for data encryption. The CMEK name should follow the format
                of
                ``projects/([^/]+)/locations/([^/]+)/keyRings/([^/]+)/cryptoKeys/([^/]+)``,
                where the ``location`` must match InstanceConfig.location.
        """

        location: str = proto.Field(
            proto.STRING,
            number=1,
        )
        cmek_key_name: str = proto.Field(
            proto.STRING,
            number=2,
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
    state: State = proto.Field(
        proto.ENUM,
        number=4,
        enum=State,
    )
    state_message: str = proto.Field(
        proto.STRING,
        number=5,
    )
    config: Config = proto.Field(
        proto.MESSAGE,
        number=6,
        message=Config,
    )


class Api(proto.Message):
    r"""A top-level description of an API.
    Produced by producers and are commitments to provide services.

    Attributes:
        name (str):
            Resource name.
        display_name (str):
            Human-meaningful name.
        description (str):
            A detailed description.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Creation timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Last update timestamp.
        availability (str):
            A user-definable description of the
            availability of this service. Format: free-form,
            but we expect single words that describe
            availability, e.g., "NONE", "TESTING",
            "PREVIEW", "GENERAL", "DEPRECATED", "SHUTDOWN".
        recommended_version (str):
            The recommended version of the API. Format:
            ``projects/{project}/locations/{location}/apis/{api}/versions/{version}``
        recommended_deployment (str):
            The recommended deployment of the API. Format:
            ``projects/{project}/locations/{location}/apis/{api}/deployments/{deployment}``
        labels (MutableMapping[str, str]):
            Labels attach identifying metadata to resources. Identifying
            metadata can be used to filter list operations.

            Label keys and values can be no longer than 64 characters
            (Unicode codepoints), can only contain lowercase letters,
            numeric characters, underscores, and dashes. International
            characters are allowed. No more than 64 user labels can be
            associated with one resource (System labels are excluded).

            See https://goo.gl/xmQnxf for more information and examples
            of labels. System reserved label keys are prefixed with
            ``apigeeregistry.googleapis.com/`` and cannot be changed.
        annotations (MutableMapping[str, str]):
            Annotations attach non-identifying metadata
            to resources.
            Annotation keys and values are less restricted
            than those of labels, but should be generally
            used for small values of broad interest. Larger,
            topic- specific metadata should be stored in
            Artifacts.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=5,
        message=timestamp_pb2.Timestamp,
    )
    availability: str = proto.Field(
        proto.STRING,
        number=6,
    )
    recommended_version: str = proto.Field(
        proto.STRING,
        number=7,
    )
    recommended_deployment: str = proto.Field(
        proto.STRING,
        number=8,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=9,
    )
    annotations: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=10,
    )


class ApiVersion(proto.Message):
    r"""Describes a particular version of an API.
    ApiVersions are what consumers actually use.

    Attributes:
        name (str):
            Resource name.
        display_name (str):
            Human-meaningful name.
        description (str):
            A detailed description.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Creation timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Last update timestamp.
        state (str):
            A user-definable description of the lifecycle
            phase of this API version. Format: free-form,
            but we expect single words that describe API
            maturity, e.g., "CONCEPT", "DESIGN",
            "DEVELOPMENT", "STAGING", "PRODUCTION",
            "DEPRECATED", "RETIRED".
        labels (MutableMapping[str, str]):
            Labels attach identifying metadata to resources. Identifying
            metadata can be used to filter list operations.

            Label keys and values can be no longer than 64 characters
            (Unicode codepoints), can only contain lowercase letters,
            numeric characters, underscores and dashes. International
            characters are allowed. No more than 64 user labels can be
            associated with one resource (System labels are excluded).

            See https://goo.gl/xmQnxf for more information and examples
            of labels. System reserved label keys are prefixed with
            ``apigeeregistry.googleapis.com/`` and cannot be changed.
        annotations (MutableMapping[str, str]):
            Annotations attach non-identifying metadata
            to resources.
            Annotation keys and values are less restricted
            than those of labels, but should be generally
            used for small values of broad interest. Larger,
            topic- specific metadata should be stored in
            Artifacts.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=5,
        message=timestamp_pb2.Timestamp,
    )
    state: str = proto.Field(
        proto.STRING,
        number=6,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=7,
    )
    annotations: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=8,
    )


class ApiSpec(proto.Message):
    r"""Describes a version of an API in a structured way.
    ApiSpecs provide formal descriptions that consumers can use to
    use a version. ApiSpec resources are intended to be
    fully-resolved descriptions of an ApiVersion. When specs consist
    of multiple files, these should be bundled together (e.g., in a
    zip archive) and stored as a unit. Multiple specs can exist to
    provide representations in different API description formats.
    Synchronization of these representations would be provided by
    tooling and background services.

    Attributes:
        name (str):
            Resource name.
        filename (str):
            A possibly-hierarchical name used to refer to
            the spec from other specs.
        description (str):
            A detailed description.
        revision_id (str):
            Output only. Immutable. The revision ID of
            the spec. A new revision is committed whenever
            the spec contents are changed. The format is an
            8-character hexadecimal string.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Creation timestamp; when the
            spec resource was created.
        revision_create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Revision creation timestamp;
            when the represented revision was created.
        revision_update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Last update timestamp: when the
            represented revision was last modified.
        mime_type (str):
            A style (format) descriptor for this spec that is specified
            as a Media Type (https://en.wikipedia.org/wiki/Media_type).
            Possible values include ``application/vnd.apigee.proto``,
            ``application/vnd.apigee.openapi``, and
            ``application/vnd.apigee.graphql``, with possible suffixes
            representing compression types. These hypothetical names are
            defined in the vendor tree defined in RFC6838
            (https://tools.ietf.org/html/rfc6838) and are not final.
            Content types can specify compression. Currently only GZip
            compression is supported (indicated with "+gzip").
        size_bytes (int):
            Output only. The size of the spec file in
            bytes. If the spec is gzipped, this is the size
            of the uncompressed spec.
        hash_ (str):
            Output only. A SHA-256 hash of the spec's
            contents. If the spec is gzipped, this is the
            hash of the uncompressed spec.
        source_uri (str):
            The original source URI of the spec (if one
            exists). This is an external location that can
            be used for reference purposes but which may not
            be authoritative since this external resource
            may change after the spec is retrieved.
        labels (MutableMapping[str, str]):
            Labels attach identifying metadata to resources. Identifying
            metadata can be used to filter list operations.

            Label keys and values can be no longer than 64 characters
            (Unicode codepoints), can only contain lowercase letters,
            numeric characters, underscores and dashes. International
            characters are allowed. No more than 64 user labels can be
            associated with one resource (System labels are excluded).

            See https://goo.gl/xmQnxf for more information and examples
            of labels. System reserved label keys are prefixed with
            ``apigeeregistry.googleapis.com/`` and cannot be changed.
        annotations (MutableMapping[str, str]):
            Annotations attach non-identifying metadata
            to resources.
            Annotation keys and values are less restricted
            than those of labels, but should be generally
            used for small values of broad interest. Larger,
            topic- specific metadata should be stored in
            Artifacts.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    filename: str = proto.Field(
        proto.STRING,
        number=2,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    revision_id: str = proto.Field(
        proto.STRING,
        number=4,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=5,
        message=timestamp_pb2.Timestamp,
    )
    revision_create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )
    revision_update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    mime_type: str = proto.Field(
        proto.STRING,
        number=8,
    )
    size_bytes: int = proto.Field(
        proto.INT32,
        number=9,
    )
    hash_: str = proto.Field(
        proto.STRING,
        number=10,
    )
    source_uri: str = proto.Field(
        proto.STRING,
        number=11,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=14,
    )
    annotations: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=15,
    )


class ApiDeployment(proto.Message):
    r"""Describes a service running at particular address that
    provides a particular version of an API. ApiDeployments have
    revisions which correspond to different configurations of a
    single deployment in time. Revision identifiers should be
    updated whenever the served API spec or endpoint address
    changes.

    Attributes:
        name (str):
            Resource name.
        display_name (str):
            Human-meaningful name.
        description (str):
            A detailed description.
        revision_id (str):
            Output only. Immutable. The revision ID of
            the deployment. A new revision is committed
            whenever the deployment contents are changed.
            The format is an 8-character hexadecimal string.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Creation timestamp; when the
            deployment resource was created.
        revision_create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Revision creation timestamp;
            when the represented revision was created.
        revision_update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Last update timestamp: when the
            represented revision was last modified.
        api_spec_revision (str):
            The full resource name (including revision ID) of the spec
            of the API being served by the deployment. Changes to this
            value will update the revision. Format:
            ``apis/{api}/deployments/{deployment}``
        endpoint_uri (str):
            The address where the deployment is serving.
            Changes to this value will update the revision.
        external_channel_uri (str):
            The address of the external channel of the
            API (e.g., the Developer Portal). Changes to
            this value will not affect the revision.
        intended_audience (str):
            Text briefly identifying the intended
            audience of the API. Changes to this value will
            not affect the revision.
        access_guidance (str):
            Text briefly describing how to access the
            endpoint. Changes to this value will not affect
            the revision.
        labels (MutableMapping[str, str]):
            Labels attach identifying metadata to resources. Identifying
            metadata can be used to filter list operations.

            Label keys and values can be no longer than 64 characters
            (Unicode codepoints), can only contain lowercase letters,
            numeric characters, underscores and dashes. International
            characters are allowed. No more than 64 user labels can be
            associated with one resource (System labels are excluded).

            See https://goo.gl/xmQnxf for more information and examples
            of labels. System reserved label keys are prefixed with
            ``apigeeregistry.googleapis.com/`` and cannot be changed.
        annotations (MutableMapping[str, str]):
            Annotations attach non-identifying metadata
            to resources.
            Annotation keys and values are less restricted
            than those of labels, but should be generally
            used for small values of broad interest. Larger,
            topic- specific metadata should be stored in
            Artifacts.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    revision_id: str = proto.Field(
        proto.STRING,
        number=4,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=5,
        message=timestamp_pb2.Timestamp,
    )
    revision_create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )
    revision_update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    api_spec_revision: str = proto.Field(
        proto.STRING,
        number=8,
    )
    endpoint_uri: str = proto.Field(
        proto.STRING,
        number=9,
    )
    external_channel_uri: str = proto.Field(
        proto.STRING,
        number=10,
    )
    intended_audience: str = proto.Field(
        proto.STRING,
        number=11,
    )
    access_guidance: str = proto.Field(
        proto.STRING,
        number=12,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=14,
    )
    annotations: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=15,
    )


class ApiVersionEventData(proto.Message):
    r"""The data within all ApiVersion events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.apigeeregistry_v1.types.ApiVersion):
            Optional. The ApiVersion event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'ApiVersion' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='ApiVersion',
    )


class InstanceEventData(proto.Message):
    r"""The data within all Instance events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.apigeeregistry_v1.types.Instance):
            Optional. The Instance event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Instance' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Instance',
    )


class ApiSpecEventData(proto.Message):
    r"""The data within all ApiSpec events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.apigeeregistry_v1.types.ApiSpec):
            Optional. The ApiSpec event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'ApiSpec' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='ApiSpec',
    )


class ApiDeploymentEventData(proto.Message):
    r"""The data within all ApiDeployment events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.apigeeregistry_v1.types.ApiDeployment):
            Optional. The ApiDeployment event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'ApiDeployment' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='ApiDeployment',
    )


class ApiEventData(proto.Message):
    r"""The data within all Api events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.apigeeregistry_v1.types.Api):
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
