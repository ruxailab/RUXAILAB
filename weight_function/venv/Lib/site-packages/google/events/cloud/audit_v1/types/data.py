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

from google.api import monitored_resource_pb2  # type: ignore
from google.protobuf import struct_pb2  # type: ignore
from google.protobuf import timestamp_pb2  # type: ignore
from google.rpc import status_pb2  # type: ignore
from google.rpc.context import attribute_context_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.audit.v1',
    manifest={
        'LogSeverity',
        'LogEntryData',
        'LogEntryOperation',
        'AuditLog',
        'AuthenticationInfo',
        'AuthorizationInfo',
        'RequestMetadata',
        'ResourceLocation',
        'ServiceAccountDelegationInfo',
        'LogSplit',
    },
)


class LogSeverity(proto.Enum):
    r"""The severity of the event described in a log entry, expressed as one
    of the standard severity levels listed below. For your reference,
    the levels are assigned the listed numeric values. The effect of
    using numeric values other than those listed is undefined. Copied
    from
    https://github.com/googleapis/googleapis/blob/master/google/logging/type/log_severity.proto

    Values:
        DEFAULT (0):
            (0) The log entry has no assigned severity
            level.
        DEBUG (100):
            (100) Debug or trace information.
        INFO (200):
            (200) Routine information, such as ongoing
            status or performance.
        NOTICE (300):
            (300) Normal but significant events, such as
            start up, shut down, or a configuration change.
        WARNING (400):
            (400) Warning events might cause problems.
        ERROR (500):
            (500) Error events are likely to cause
            problems.
        CRITICAL (600):
            (600) Critical events cause more severe
            problems or outages.
        ALERT (700):
            (700) A person must take an action
            immediately.
        EMERGENCY (800):
            (800) One or more systems are unusable.
    """
    DEFAULT = 0
    DEBUG = 100
    INFO = 200
    NOTICE = 300
    WARNING = 400
    ERROR = 500
    CRITICAL = 600
    ALERT = 700
    EMERGENCY = 800


class LogEntryData(proto.Message):
    r"""The data within all Cloud Audit Logs log entry events.

    Attributes:
        log_name (str):
            The resource name of the log to which this
            log entry belongs.
        resource (google.api.monitored_resource_pb2.MonitoredResource):
            The monitored resource that produced this log
            entry.
            Example: a log entry that reports a database
            error would be associated with the monitored
            resource designating the particular database
            that reported the error.
        proto_payload (google.events.cloud.audit_v1.types.AuditLog):
            The log entry payload, which is always an
            AuditLog for Cloud Audit Log events.
        insert_id (str):
            A unique identifier for the log entry.
        labels (MutableMapping[str, str]):
            A set of user-defined (key, value) data that
            provides additional information about the log
            entry.
        operation (google.events.cloud.audit_v1.types.LogEntryOperation):
            Information about an operation associated
            with the log entry, if applicable.
        timestamp (google.protobuf.timestamp_pb2.Timestamp):
            The time the event described by the log entry
            occurred.
        receive_timestamp (google.protobuf.timestamp_pb2.Timestamp):
            The time the log entry was received by
            Logging.
        severity (google.events.cloud.audit_v1.types.LogSeverity):
            The severity of the log entry.
        trace (str):
            Resource name of the trace associated with the log entry, if
            any. If it contains a relative resource name, the name is
            assumed to be relative to ``//tracing.googleapis.com``.
            Example:
            ``projects/my-projectid/traces/06796866738c859f2f19b7cfb3214824``
        span_id (str):
            The span ID within the trace associated with the log entry,
            if any.

            For Trace spans, this is the same format that the Trace API
            v2 uses: a 16-character hexadecimal encoding of an 8-byte
            array, such as ``000000000000004a``.
        split (google.events.cloud.audit_v1.types.LogSplit):
            Information indicating this LogEntry is part
            of a sequence of multiple logs split from a
            single LogEntry.
    """

    log_name: str = proto.Field(
        proto.STRING,
        number=12,
    )
    resource: monitored_resource_pb2.MonitoredResource = proto.Field(
        proto.MESSAGE,
        number=8,
        message=monitored_resource_pb2.MonitoredResource,
    )
    proto_payload: 'AuditLog' = proto.Field(
        proto.MESSAGE,
        number=2,
        message='AuditLog',
    )
    insert_id: str = proto.Field(
        proto.STRING,
        number=4,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=11,
    )
    operation: 'LogEntryOperation' = proto.Field(
        proto.MESSAGE,
        number=15,
        message='LogEntryOperation',
    )
    timestamp: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=9,
        message=timestamp_pb2.Timestamp,
    )
    receive_timestamp: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=24,
        message=timestamp_pb2.Timestamp,
    )
    severity: 'LogSeverity' = proto.Field(
        proto.ENUM,
        number=10,
        enum='LogSeverity',
    )
    trace: str = proto.Field(
        proto.STRING,
        number=22,
    )
    span_id: str = proto.Field(
        proto.STRING,
        number=27,
    )
    split: 'LogSplit' = proto.Field(
        proto.MESSAGE,
        number=35,
        message='LogSplit',
    )


class LogEntryOperation(proto.Message):
    r"""Additional information about a potentially long-running
    operation with which a log entry is associated.

    Attributes:
        id (str):
            An arbitrary operation identifier. Log
            entries with the same identifier are assumed to
            be part of the same operation.
        producer (str):
            An arbitrary producer identifier. The combination of ``id``
            and ``producer`` must be globally unique. Examples for
            ``producer``: ``"MyDivision.MyBigCompany.com"``,
            ``"github.com/MyProject/MyApplication"``.
        first (bool):
            True if this is the first log entry in the
            operation.
        last (bool):
            True if this is the last log entry in the
            operation.
    """

    id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    producer: str = proto.Field(
        proto.STRING,
        number=2,
    )
    first: bool = proto.Field(
        proto.BOOL,
        number=3,
    )
    last: bool = proto.Field(
        proto.BOOL,
        number=4,
    )


class AuditLog(proto.Message):
    r"""Common audit log format for Google Cloud Platform API operations.
    Copied from
    https://github.com/googleapis/googleapis/blob/master/google/cloud/audit/audit_log.proto,
    but changing service_data from Any to Struct.

    Attributes:
        service_name (str):
            The name of the API service performing the operation. For
            example, ``"datastore.googleapis.com"``.
        method_name (str):
            The name of the service method or operation.
            For API calls, this should be the name of the
            API method. For example,

                "google.datastore.v1.Datastore.RunQuery"
                "google.logging.v1.LoggingService.DeleteLog".
        resource_name (str):
            The resource or collection that is the target of the
            operation. The name is a scheme-less URI, not including the
            API service name. For example:

            ::

                "shelves/SHELF_ID/books"
                "shelves/SHELF_ID/books/BOOK_ID".
        resource_location (google.events.cloud.audit_v1.types.ResourceLocation):
            The resource location information.
        resource_original_state (google.protobuf.struct_pb2.Struct):
            The resource's original state before mutation. Present only
            for operations which have successfully modified the targeted
            resource(s). In general, this field should contain all
            changed fields, except those that are already been included
            in ``request``, ``response``, ``metadata`` or
            ``service_data`` fields. When the JSON object represented
            here has a proto equivalent, the proto name will be
            indicated in the ``@type`` property.
        num_response_items (int):
            The number of items returned from a List or
            Query API method, if applicable.
        status (google.rpc.status_pb2.Status):
            The status of the overall operation.
        authentication_info (google.events.cloud.audit_v1.types.AuthenticationInfo):
            Authentication information.
        authorization_info (MutableSequence[google.events.cloud.audit_v1.types.AuthorizationInfo]):
            Authorization information. If there are
            multiple resources or permissions involved, then
            there is one AuthorizationInfo element for each
            {resource, permission} tuple.
        request_metadata (google.events.cloud.audit_v1.types.RequestMetadata):
            Metadata about the operation.
        request (google.protobuf.struct_pb2.Struct):
            The operation request. This may not include all request
            parameters, such as those that are too large,
            privacy-sensitive, or duplicated elsewhere in the log
            record. It should never include user-generated data, such as
            file contents. When the JSON object represented here has a
            proto equivalent, the proto name will be indicated in the
            ``@type`` property.
        response (google.protobuf.struct_pb2.Struct):
            The operation response. This may not include all response
            elements, such as those that are too large,
            privacy-sensitive, or duplicated elsewhere in the log
            record. It should never include user-generated data, such as
            file contents. When the JSON object represented here has a
            proto equivalent, the proto name will be indicated in the
            ``@type`` property.
        metadata (google.protobuf.struct_pb2.Struct):
            Other service-specific data about the
            request, response, and other information
            associated with the current audited event.
        service_data (google.protobuf.struct_pb2.Struct):
            Deprecated: Use ``metadata`` field instead. Other
            service-specific data about the request, response, and other
            activities. When the JSON object represented here has a
            proto equivalent, the proto name will be indicated in the
            ``@type`` property.
    """

    service_name: str = proto.Field(
        proto.STRING,
        number=7,
    )
    method_name: str = proto.Field(
        proto.STRING,
        number=8,
    )
    resource_name: str = proto.Field(
        proto.STRING,
        number=11,
    )
    resource_location: 'ResourceLocation' = proto.Field(
        proto.MESSAGE,
        number=20,
        message='ResourceLocation',
    )
    resource_original_state: struct_pb2.Struct = proto.Field(
        proto.MESSAGE,
        number=19,
        message=struct_pb2.Struct,
    )
    num_response_items: int = proto.Field(
        proto.INT64,
        number=12,
    )
    status: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=2,
        message=status_pb2.Status,
    )
    authentication_info: 'AuthenticationInfo' = proto.Field(
        proto.MESSAGE,
        number=3,
        message='AuthenticationInfo',
    )
    authorization_info: MutableSequence['AuthorizationInfo'] = proto.RepeatedField(
        proto.MESSAGE,
        number=9,
        message='AuthorizationInfo',
    )
    request_metadata: 'RequestMetadata' = proto.Field(
        proto.MESSAGE,
        number=4,
        message='RequestMetadata',
    )
    request: struct_pb2.Struct = proto.Field(
        proto.MESSAGE,
        number=16,
        message=struct_pb2.Struct,
    )
    response: struct_pb2.Struct = proto.Field(
        proto.MESSAGE,
        number=17,
        message=struct_pb2.Struct,
    )
    metadata: struct_pb2.Struct = proto.Field(
        proto.MESSAGE,
        number=18,
        message=struct_pb2.Struct,
    )
    service_data: struct_pb2.Struct = proto.Field(
        proto.MESSAGE,
        number=15,
        message=struct_pb2.Struct,
    )


class AuthenticationInfo(proto.Message):
    r"""Authentication information for the operation.

    Attributes:
        principal_email (str):
            The email address of the authenticated user (or service
            account on behalf of third party principal) making the
            request. For third party identity callers, the
            ``principal_subject`` field is populated instead of this
            field. For privacy reasons, the principal email address is
            sometimes redacted. For more information, see `Caller
            identities in audit
            logs <https://cloud.google.com/logging/docs/audit#user-id>`__.
        authority_selector (str):
            The authority selector specified by the
            requestor, if any. It is not guaranteed that the
            principal was allowed to use this authority.
        third_party_principal (google.protobuf.struct_pb2.Struct):
            The third party identification (if any) of the authenticated
            user making the request. When the JSON object represented
            here has a proto equivalent, the proto name will be
            indicated in the ``@type`` property.
        service_account_key_name (str):
            The name of the service account key used to create or
            exchange credentials for authenticating the service account
            making the request. This is a scheme-less URI full resource
            name. For example:

            "//iam.googleapis.com/projects/{PROJECT_ID}/serviceAccounts/{ACCOUNT}/keys/{key}".
        service_account_delegation_info (MutableSequence[google.events.cloud.audit_v1.types.ServiceAccountDelegationInfo]):
            Identity delegation history of an
            authenticated service account that makes the
            request. It contains information on the real
            authorities that try to access GCP resources by
            delegating on a service account. When multiple
            authorities present, they are guaranteed to be
            sorted based on the original ordering of the
            identity delegation events.
        principal_subject (str):
            String representation of identity of
            requesting party. Populated for both first and
            third party identities.
    """

    principal_email: str = proto.Field(
        proto.STRING,
        number=1,
    )
    authority_selector: str = proto.Field(
        proto.STRING,
        number=2,
    )
    third_party_principal: struct_pb2.Struct = proto.Field(
        proto.MESSAGE,
        number=4,
        message=struct_pb2.Struct,
    )
    service_account_key_name: str = proto.Field(
        proto.STRING,
        number=5,
    )
    service_account_delegation_info: MutableSequence['ServiceAccountDelegationInfo'] = proto.RepeatedField(
        proto.MESSAGE,
        number=6,
        message='ServiceAccountDelegationInfo',
    )
    principal_subject: str = proto.Field(
        proto.STRING,
        number=8,
    )


class AuthorizationInfo(proto.Message):
    r"""Authorization information for the operation.

    Attributes:
        resource (str):
            The resource being accessed, as a REST-style
            string. For example:
            bigquery.googleapis.com/projects/PROJECTID/datasets/DATASETID
        permission (str):
            The required IAM permission.
        granted (bool):
            Whether or not authorization for ``resource`` and
            ``permission`` was granted.
        resource_attributes (google.rpc.context.attribute_context_pb2.Resource):
            Resource attributes used in IAM condition evaluation. This
            field contains resource attributes like resource type and
            resource name.

            To get the whole view of the attributes used in IAM
            condition evaluation, the user must also look into
            ``AuditLogData.request_metadata.request_attributes``.
    """

    resource: str = proto.Field(
        proto.STRING,
        number=1,
    )
    permission: str = proto.Field(
        proto.STRING,
        number=2,
    )
    granted: bool = proto.Field(
        proto.BOOL,
        number=3,
    )
    resource_attributes: attribute_context_pb2.AttributeContext.Resource = proto.Field(
        proto.MESSAGE,
        number=5,
        message=attribute_context_pb2.AttributeContext.Resource,
    )


class RequestMetadata(proto.Message):
    r"""Metadata about the request.

    Attributes:
        caller_ip (str):
            The IP address of the caller. For caller from internet, this
            will be public IPv4 or IPv6 address. For caller from a
            Compute Engine VM with external IP address, this will be the
            VM's external IP address. For caller from a Compute Engine
            VM without external IP address, if the VM is in the same
            organization (or project) as the accessed resource,
            ``caller_ip`` will be the VM's internal IPv4 address,
            otherwise the ``caller_ip`` will be redacted to
            "gce-internal-ip". See
            https://cloud.google.com/compute/docs/vpc/ for more
            information.
        caller_supplied_user_agent (str):
            The user agent of the caller. This information is not
            authenticated and should be treated accordingly. For
            example:

            -  ``google-api-python-client/1.4.0``: The request was made
               by the Google API client for Python.
            -  ``Cloud SDK Command Line Tool apitools-client/1.0 gcloud/0.9.62``:
               The request was made by the Google Cloud SDK CLI
               (gcloud).
            -  ``AppEngine-Google; (+http://code.google.com/appengine; appid: s~my-project``:
               The request was made from the ``my-project`` App Engine
               app.
        caller_network (str):
            The network of the caller. Set only if the network host
            project is part of the same GCP organization (or project) as
            the accessed resource. See
            https://cloud.google.com/compute/docs/vpc/ for more
            information. This is a scheme-less URI full resource name.
            For example:

            ::

                "//compute.googleapis.com/projects/PROJECT_ID/global/networks/NETWORK_ID".
        request_attributes (google.rpc.context.attribute_context_pb2.Request):
            Request attributes used in IAM condition evaluation. This
            field contains request attributes like request time and
            access levels associated with the request.

            To get the whole view of the attributes used in IAM
            condition evaluation, the user must also look into
            ``AuditLog.authentication_info.resource_attributes``.
        destination_attributes (google.rpc.context.attribute_context_pb2.Peer):
            The destination of a network activity, such
            as accepting a TCP connection. In a multi hop
            network activity, the destination represents the
            receiver of the last hop. Only two fields are
            used in this message, Peer.port and Peer.ip.
            These fields are optionally populated by those
            services utilizing the IAM condition feature.
    """

    caller_ip: str = proto.Field(
        proto.STRING,
        number=1,
    )
    caller_supplied_user_agent: str = proto.Field(
        proto.STRING,
        number=2,
    )
    caller_network: str = proto.Field(
        proto.STRING,
        number=3,
    )
    request_attributes: attribute_context_pb2.AttributeContext.Request = proto.Field(
        proto.MESSAGE,
        number=7,
        message=attribute_context_pb2.AttributeContext.Request,
    )
    destination_attributes: attribute_context_pb2.AttributeContext.Peer = proto.Field(
        proto.MESSAGE,
        number=8,
        message=attribute_context_pb2.AttributeContext.Peer,
    )


class ResourceLocation(proto.Message):
    r"""Location information about a resource.

    Attributes:
        current_locations (MutableSequence[str]):
            The locations of a resource after the execution of the
            operation. Requests to create or delete a location based
            resource must populate the 'current_locations' field and not
            the 'original_locations' field. For example:

            ::

                "europe-west1-a"
                "us-east1"
                "nam3".
        original_locations (MutableSequence[str]):
            The locations of a resource prior to the execution of the
            operation. Requests that mutate the resource's location must
            populate both the 'original_locations' as well as the
            'current_locations' fields. For example:

            ::

                "europe-west1-a"
                "us-east1"
                "nam3".
    """

    current_locations: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=1,
    )
    original_locations: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=2,
    )


class ServiceAccountDelegationInfo(proto.Message):
    r"""Identity delegation history of an authenticated service
    account.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        first_party_principal (google.events.cloud.audit_v1.types.ServiceAccountDelegationInfo.FirstPartyPrincipal):
            First party (Google) identity as the real
            authority.

            This field is a member of `oneof`_ ``Authority``.
        third_party_principal (google.events.cloud.audit_v1.types.ServiceAccountDelegationInfo.ThirdPartyPrincipal):
            Third party identity as the real authority.

            This field is a member of `oneof`_ ``Authority``.
    """

    class FirstPartyPrincipal(proto.Message):
        r"""First party identity principal.

        Attributes:
            principal_email (str):
                The email address of a Google account.
            service_metadata (google.protobuf.struct_pb2.Struct):
                Metadata about the service that uses the
                service account.
        """

        principal_email: str = proto.Field(
            proto.STRING,
            number=1,
        )
        service_metadata: struct_pb2.Struct = proto.Field(
            proto.MESSAGE,
            number=2,
            message=struct_pb2.Struct,
        )

    class ThirdPartyPrincipal(proto.Message):
        r"""Third party identity principal.

        Attributes:
            third_party_claims (google.protobuf.struct_pb2.Struct):
                Metadata about third party identity.
        """

        third_party_claims: struct_pb2.Struct = proto.Field(
            proto.MESSAGE,
            number=1,
            message=struct_pb2.Struct,
        )

    first_party_principal: FirstPartyPrincipal = proto.Field(
        proto.MESSAGE,
        number=1,
        oneof='Authority',
        message=FirstPartyPrincipal,
    )
    third_party_principal: ThirdPartyPrincipal = proto.Field(
        proto.MESSAGE,
        number=2,
        oneof='Authority',
        message=ThirdPartyPrincipal,
    )


class LogSplit(proto.Message):
    r"""Additional information used to correlate multiple LogEntries.
    Used when a single LogEntry would exceed the Google Cloud
    Logging size limit and is split across multiple entries.

    Attributes:
        uid (str):
            A globally unique identifier for all LogEntries in a
            sequence of split logs. All LogEntries with the same
            \|LogSplit.uid\| are assumed to be part of the same sequence
            of split logs.
        index (int):
            The index of this LogEntry in the sequence of split logs.
            LogEntries are given \|index\| values 0, 1, ..., n-1 for a
            sequence of n entries.
        total_splits (int):
            The total number of logs that the original
            LogEntry was split into.
    """

    uid: str = proto.Field(
        proto.STRING,
        number=1,
    )
    index: int = proto.Field(
        proto.INT32,
        number=2,
    )
    total_splits: int = proto.Field(
        proto.INT32,
        number=3,
    )


__all__ = tuple(sorted(__protobuf__.manifest))
