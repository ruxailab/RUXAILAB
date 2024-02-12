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
from google.protobuf import wrappers_pb2  # type: ignore
from google.type import dayofweek_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.metastore.v1',
    manifest={
        'Federation',
        'BackendMetastore',
        'Service',
        'MaintenanceWindow',
        'HiveMetastoreConfig',
        'KerberosConfig',
        'Secret',
        'EncryptionConfig',
        'AuxiliaryVersionConfig',
        'NetworkConfig',
        'TelemetryConfig',
        'MetadataManagementActivity',
        'MetadataImport',
        'MetadataExport',
        'Backup',
        'Restore',
        'ScalingConfig',
        'DatabaseDumpSpec',
        'MetadataImportEventData',
        'FederationEventData',
        'BackupEventData',
        'ServiceEventData',
    },
)


class Federation(proto.Message):
    r"""Represents a federation of multiple backend metastores.

    Attributes:
        name (str):
            Immutable. The relative resource name of the federation, of
            the form:
            projects/{project_number}/locations/{location_id}/federations/{federation_id}`.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the metastore
            federation was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the metastore
            federation was last updated.
        labels (MutableMapping[str, str]):
            User-defined labels for the metastore
            federation.
        version (str):
            Immutable. The Apache Hive metastore version
            of the federation. All backend metastore
            versions must be compatible with the federation
            version.
        backend_metastores (MutableMapping[int, google.events.cloud.metastore_v1.types.BackendMetastore]):
            A map from ``BackendMetastore`` rank to
            ``BackendMetastore``\ s from which the federation service
            serves metadata at query time. The map key represents the
            order in which ``BackendMetastore``\ s should be evaluated
            to resolve database names at query time and should be
            greater than or equal to zero. A ``BackendMetastore`` with a
            lower number will be evaluated before a ``BackendMetastore``
            with a higher number.
        endpoint_uri (str):
            Output only. The federation endpoint.
        state (google.events.cloud.metastore_v1.types.Federation.State):
            Output only. The current state of the
            federation.
        state_message (str):
            Output only. Additional information about the
            current state of the metastore federation, if
            available.
        uid (str):
            Output only. The globally unique resource
            identifier of the metastore federation.
    """
    class State(proto.Enum):
        r"""The current state of the federation.

        Values:
            STATE_UNSPECIFIED (0):
                The state of the metastore federation is
                unknown.
            CREATING (1):
                The metastore federation is in the process of
                being created.
            ACTIVE (2):
                The metastore federation is running and ready
                to serve queries.
            UPDATING (3):
                The metastore federation is being updated. It
                remains usable but cannot accept additional
                update requests or be deleted at this time.
            DELETING (4):
                The metastore federation is undergoing
                deletion. It cannot be used.
            ERROR (5):
                The metastore federation has encountered an
                error and cannot be used. The metastore
                federation should be deleted.
        """
        STATE_UNSPECIFIED = 0
        CREATING = 1
        ACTIVE = 2
        UPDATING = 3
        DELETING = 4
        ERROR = 5

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
    version: str = proto.Field(
        proto.STRING,
        number=5,
    )
    backend_metastores: MutableMapping[int, 'BackendMetastore'] = proto.MapField(
        proto.INT32,
        proto.MESSAGE,
        number=6,
        message='BackendMetastore',
    )
    endpoint_uri: str = proto.Field(
        proto.STRING,
        number=7,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=8,
        enum=State,
    )
    state_message: str = proto.Field(
        proto.STRING,
        number=9,
    )
    uid: str = proto.Field(
        proto.STRING,
        number=10,
    )


class BackendMetastore(proto.Message):
    r"""Represents a backend metastore for the federation.

    Attributes:
        name (str):
            The relative resource name of the metastore that is being
            federated. The formats of the relative resource names for
            the currently supported metastores are listed below:

            -  BigQuery

               -  ``projects/{project_id}``

            -  Dataproc Metastore

               -  ``projects/{project_id}/locations/{location}/services/{service_id}``
        metastore_type (google.events.cloud.metastore_v1.types.BackendMetastore.MetastoreType):
            The type of the backend metastore.
    """
    class MetastoreType(proto.Enum):
        r"""The type of the backend metastore.

        Values:
            METASTORE_TYPE_UNSPECIFIED (0):
                The metastore type is not set.
            DATAPROC_METASTORE (3):
                The backend metastore is Dataproc Metastore.
        """
        METASTORE_TYPE_UNSPECIFIED = 0
        DATAPROC_METASTORE = 3

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    metastore_type: MetastoreType = proto.Field(
        proto.ENUM,
        number=2,
        enum=MetastoreType,
    )


class Service(proto.Message):
    r"""A managed metastore service that serves metadata queries.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        hive_metastore_config (google.events.cloud.metastore_v1.types.HiveMetastoreConfig):
            Configuration information specific to running
            Hive metastore software as the metastore
            service.

            This field is a member of `oneof`_ ``metastore_config``.
        name (str):
            Immutable. The relative resource name of the metastore
            service, in the following format:

            ``projects/{project_number}/locations/{location_id}/services/{service_id}``.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the metastore
            service was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the metastore
            service was last updated.
        labels (MutableMapping[str, str]):
            User-defined labels for the metastore
            service.
        network (str):
            Immutable. The relative resource name of the VPC network on
            which the instance can be accessed. It is specified in the
            following form:

            ``projects/{project_number}/global/networks/{network_id}``.
        endpoint_uri (str):
            Output only. The URI of the endpoint used to
            access the metastore service.
        port (int):
            The TCP port at which the metastore service
            is reached. Default: 9083.
        state (google.events.cloud.metastore_v1.types.Service.State):
            Output only. The current state of the
            metastore service.
        state_message (str):
            Output only. Additional information about the
            current state of the metastore service, if
            available.
        artifact_gcs_uri (str):
            Output only. A Cloud Storage URI (starting with ``gs://``)
            that specifies where artifacts related to the metastore
            service are stored.
        tier (google.events.cloud.metastore_v1.types.Service.Tier):
            The tier of the service.
        maintenance_window (google.events.cloud.metastore_v1.types.MaintenanceWindow):
            The one hour maintenance window of the
            metastore service. This specifies when the
            service can be restarted for maintenance
            purposes in UTC time. Maintenance window is not
            needed for services with the SPANNER database
            type.
        uid (str):
            Output only. The globally unique resource
            identifier of the metastore service.
        metadata_management_activity (google.events.cloud.metastore_v1.types.MetadataManagementActivity):
            Output only. The metadata management
            activities of the metastore service.
        release_channel (google.events.cloud.metastore_v1.types.Service.ReleaseChannel):
            Immutable. The release channel of the service. If
            unspecified, defaults to ``STABLE``.
        encryption_config (google.events.cloud.metastore_v1.types.EncryptionConfig):
            Immutable. Information used to configure the
            Dataproc Metastore service to encrypt customer
            data at rest. Cannot be updated.
        network_config (google.events.cloud.metastore_v1.types.NetworkConfig):
            The configuration specifying the network
            settings for the Dataproc Metastore service.
        database_type (google.events.cloud.metastore_v1.types.Service.DatabaseType):
            Immutable. The database type that the
            Metastore service stores its data.
        telemetry_config (google.events.cloud.metastore_v1.types.TelemetryConfig):
            The configuration specifying telemetry settings for the
            Dataproc Metastore service. If unspecified defaults to
            ``JSON``.
        scaling_config (google.events.cloud.metastore_v1.types.ScalingConfig):
            Scaling configuration of the metastore
            service.
    """
    class State(proto.Enum):
        r"""The current state of the metastore service.

        Values:
            STATE_UNSPECIFIED (0):
                The state of the metastore service is
                unknown.
            CREATING (1):
                The metastore service is in the process of
                being created.
            ACTIVE (2):
                The metastore service is running and ready to
                serve queries.
            SUSPENDING (3):
                The metastore service is entering suspension.
                Its query-serving availability may cease
                unexpectedly.
            SUSPENDED (4):
                The metastore service is suspended and unable
                to serve queries.
            UPDATING (5):
                The metastore service is being updated. It
                remains usable but cannot accept additional
                update requests or be deleted at this time.
            DELETING (6):
                The metastore service is undergoing deletion.
                It cannot be used.
            ERROR (7):
                The metastore service has encountered an
                error and cannot be used. The metastore service
                should be deleted.
        """
        STATE_UNSPECIFIED = 0
        CREATING = 1
        ACTIVE = 2
        SUSPENDING = 3
        SUSPENDED = 4
        UPDATING = 5
        DELETING = 6
        ERROR = 7

    class Tier(proto.Enum):
        r"""Available service tiers.

        Values:
            TIER_UNSPECIFIED (0):
                The tier is not set.
            DEVELOPER (1):
                The developer tier provides limited
                scalability and no fault tolerance. Good for
                low-cost proof-of-concept.
            ENTERPRISE (3):
                The enterprise tier provides multi-zone high
                availability, and sufficient scalability for
                enterprise-level Dataproc Metastore workloads.
        """
        TIER_UNSPECIFIED = 0
        DEVELOPER = 1
        ENTERPRISE = 3

    class ReleaseChannel(proto.Enum):
        r"""Release channels bundle features of varying levels of
        stability. Newer features may be introduced initially into less
        stable release channels and can be automatically promoted into
        more stable release channels.

        Values:
            RELEASE_CHANNEL_UNSPECIFIED (0):
                Release channel is not specified.
            CANARY (1):
                The ``CANARY`` release channel contains the newest features,
                which may be unstable and subject to unresolved issues with
                no known workarounds. Services using the ``CANARY`` release
                channel are not subject to any SLAs.
            STABLE (2):
                The ``STABLE`` release channel contains features that are
                considered stable and have been validated for production
                use.
        """
        RELEASE_CHANNEL_UNSPECIFIED = 0
        CANARY = 1
        STABLE = 2

    class DatabaseType(proto.Enum):
        r"""The backend database type for the metastore service.

        Values:
            DATABASE_TYPE_UNSPECIFIED (0):
                The DATABASE_TYPE is not set.
            MYSQL (1):
                MySQL is used to persist the metastore data.
            SPANNER (2):
                Spanner is used to persist the metastore
                data.
        """
        DATABASE_TYPE_UNSPECIFIED = 0
        MYSQL = 1
        SPANNER = 2

    hive_metastore_config: 'HiveMetastoreConfig' = proto.Field(
        proto.MESSAGE,
        number=5,
        oneof='metastore_config',
        message='HiveMetastoreConfig',
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
    network: str = proto.Field(
        proto.STRING,
        number=7,
    )
    endpoint_uri: str = proto.Field(
        proto.STRING,
        number=8,
    )
    port: int = proto.Field(
        proto.INT32,
        number=9,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=10,
        enum=State,
    )
    state_message: str = proto.Field(
        proto.STRING,
        number=11,
    )
    artifact_gcs_uri: str = proto.Field(
        proto.STRING,
        number=12,
    )
    tier: Tier = proto.Field(
        proto.ENUM,
        number=13,
        enum=Tier,
    )
    maintenance_window: 'MaintenanceWindow' = proto.Field(
        proto.MESSAGE,
        number=15,
        message='MaintenanceWindow',
    )
    uid: str = proto.Field(
        proto.STRING,
        number=16,
    )
    metadata_management_activity: 'MetadataManagementActivity' = proto.Field(
        proto.MESSAGE,
        number=17,
        message='MetadataManagementActivity',
    )
    release_channel: ReleaseChannel = proto.Field(
        proto.ENUM,
        number=19,
        enum=ReleaseChannel,
    )
    encryption_config: 'EncryptionConfig' = proto.Field(
        proto.MESSAGE,
        number=20,
        message='EncryptionConfig',
    )
    network_config: 'NetworkConfig' = proto.Field(
        proto.MESSAGE,
        number=21,
        message='NetworkConfig',
    )
    database_type: DatabaseType = proto.Field(
        proto.ENUM,
        number=22,
        enum=DatabaseType,
    )
    telemetry_config: 'TelemetryConfig' = proto.Field(
        proto.MESSAGE,
        number=23,
        message='TelemetryConfig',
    )
    scaling_config: 'ScalingConfig' = proto.Field(
        proto.MESSAGE,
        number=24,
        message='ScalingConfig',
    )


class MaintenanceWindow(proto.Message):
    r"""Maintenance window. This specifies when Dataproc Metastore
    may perform system maintenance operation to the service.

    Attributes:
        hour_of_day (google.protobuf.wrappers_pb2.Int32Value):
            The hour of day (0-23) when the window
            starts.
        day_of_week (google.type.dayofweek_pb2.DayOfWeek):
            The day of week, when the window starts.
    """

    hour_of_day: wrappers_pb2.Int32Value = proto.Field(
        proto.MESSAGE,
        number=1,
        message=wrappers_pb2.Int32Value,
    )
    day_of_week: dayofweek_pb2.DayOfWeek = proto.Field(
        proto.ENUM,
        number=2,
        enum=dayofweek_pb2.DayOfWeek,
    )


class HiveMetastoreConfig(proto.Message):
    r"""Specifies configuration information specific to running Hive
    metastore software as the metastore service.

    Attributes:
        version (str):
            Immutable. The Hive metastore schema version.
        config_overrides (MutableMapping[str, str]):
            A mapping of Hive metastore configuration key-value pairs to
            apply to the Hive metastore (configured in
            ``hive-site.xml``). The mappings override system defaults
            (some keys cannot be overridden). These overrides are also
            applied to auxiliary versions and can be further customized
            in the auxiliary version's ``AuxiliaryVersionConfig``.
        kerberos_config (google.events.cloud.metastore_v1.types.KerberosConfig):
            Information used to configure the Hive metastore service as
            a service principal in a Kerberos realm. To disable
            Kerberos, use the ``UpdateService`` method and specify this
            field's path (``hive_metastore_config.kerberos_config``) in
            the request's ``update_mask`` while omitting this field from
            the request's ``service``.
        auxiliary_versions (MutableMapping[str, google.events.cloud.metastore_v1.types.AuxiliaryVersionConfig]):
            A mapping of Hive metastore version to the auxiliary version
            configuration. When specified, a secondary Hive metastore
            service is created along with the primary service. All
            auxiliary versions must be less than the service's primary
            version. The key is the auxiliary service name and it must
            match the regular expression `a-z <[-a-z0-9]*[a-z0-9]>`__?.
            This means that the first character must be a lowercase
            letter, and all the following characters must be hyphens,
            lowercase letters, or digits, except the last character,
            which cannot be a hyphen.
    """

    version: str = proto.Field(
        proto.STRING,
        number=1,
    )
    config_overrides: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=2,
    )
    kerberos_config: 'KerberosConfig' = proto.Field(
        proto.MESSAGE,
        number=3,
        message='KerberosConfig',
    )
    auxiliary_versions: MutableMapping[str, 'AuxiliaryVersionConfig'] = proto.MapField(
        proto.STRING,
        proto.MESSAGE,
        number=5,
        message='AuxiliaryVersionConfig',
    )


class KerberosConfig(proto.Message):
    r"""Configuration information for a Kerberos principal.

    Attributes:
        keytab (google.events.cloud.metastore_v1.types.Secret):
            A Kerberos keytab file that can be used to
            authenticate a service principal with a Kerberos
            Key Distribution Center (KDC).
        principal (str):
            A Kerberos principal that exists in the both the keytab the
            KDC to authenticate as. A typical principal is of the form
            ``primary/instance@REALM``, but there is no exact format.
        krb5_config_gcs_uri (str):
            A Cloud Storage URI that specifies the path to a krb5.conf
            file. It is of the form
            ``gs://{bucket_name}/path/to/krb5.conf``, although the file
            does not need to be named krb5.conf explicitly.
    """

    keytab: 'Secret' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='Secret',
    )
    principal: str = proto.Field(
        proto.STRING,
        number=2,
    )
    krb5_config_gcs_uri: str = proto.Field(
        proto.STRING,
        number=3,
    )


class Secret(proto.Message):
    r"""A securely stored value.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        cloud_secret (str):
            The relative resource name of a Secret Manager secret
            version, in the following form:

            ``projects/{project_number}/secrets/{secret_id}/versions/{version_id}``.

            This field is a member of `oneof`_ ``value``.
    """

    cloud_secret: str = proto.Field(
        proto.STRING,
        number=2,
        oneof='value',
    )


class EncryptionConfig(proto.Message):
    r"""Encryption settings for the service.

    Attributes:
        kms_key (str):
            The fully qualified customer provided Cloud KMS key name to
            use for customer data encryption, in the following form:

            ``projects/{project_number}/locations/{location_id}/keyRings/{key_ring_id}/cryptoKeys/{crypto_key_id}``.
    """

    kms_key: str = proto.Field(
        proto.STRING,
        number=1,
    )


class AuxiliaryVersionConfig(proto.Message):
    r"""Configuration information for the auxiliary service versions.

    Attributes:
        version (str):
            The Hive metastore version of the auxiliary
            service. It must be less than the primary Hive
            metastore service's version.
        config_overrides (MutableMapping[str, str]):
            A mapping of Hive metastore configuration key-value pairs to
            apply to the auxiliary Hive metastore (configured in
            ``hive-site.xml``) in addition to the primary version's
            overrides. If keys are present in both the auxiliary
            version's overrides and the primary version's overrides, the
            value from the auxiliary version's overrides takes
            precedence.
        network_config (google.events.cloud.metastore_v1.types.NetworkConfig):
            Output only. The network configuration
            contains the endpoint URI(s) of the auxiliary
            Hive metastore service.
    """

    version: str = proto.Field(
        proto.STRING,
        number=1,
    )
    config_overrides: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=2,
    )
    network_config: 'NetworkConfig' = proto.Field(
        proto.MESSAGE,
        number=3,
        message='NetworkConfig',
    )


class NetworkConfig(proto.Message):
    r"""Network configuration for the Dataproc Metastore service.

    Attributes:
        consumers (MutableSequence[google.events.cloud.metastore_v1.types.NetworkConfig.Consumer]):
            Immutable. The consumer-side network
            configuration for the Dataproc Metastore
            instance.
    """

    class Consumer(proto.Message):
        r"""Contains information of the customer's network
        configurations.


        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            subnetwork (str):
                Immutable. The subnetwork of the customer project from which
                an IP address is reserved and used as the Dataproc Metastore
                service's endpoint. It is accessible to hosts in the subnet
                and to all hosts in a subnet in the same region and same
                network. There must be at least one IP address available in
                the subnet's primary range. The subnet is specified in the
                following form:

                ``projects/{project_number}/regions/{region_id}/subnetworks/{subnetwork_id}``

                This field is a member of `oneof`_ ``vpc_resource``.
            endpoint_uri (str):
                Output only. The URI of the endpoint used to
                access the metastore service.
        """

        subnetwork: str = proto.Field(
            proto.STRING,
            number=1,
            oneof='vpc_resource',
        )
        endpoint_uri: str = proto.Field(
            proto.STRING,
            number=3,
        )

    consumers: MutableSequence[Consumer] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message=Consumer,
    )


class TelemetryConfig(proto.Message):
    r"""Telemetry Configuration for the Dataproc Metastore service.

    Attributes:
        log_format (google.events.cloud.metastore_v1.types.TelemetryConfig.LogFormat):
            The output format of the Dataproc Metastore
            service's logs.
    """
    class LogFormat(proto.Enum):
        r"""

        Values:
            LOG_FORMAT_UNSPECIFIED (0):
                The LOG_FORMAT is not set.
            LEGACY (1):
                Logging output uses the legacy ``textPayload`` format.
            JSON (2):
                Logging output uses the ``jsonPayload`` format.
        """
        LOG_FORMAT_UNSPECIFIED = 0
        LEGACY = 1
        JSON = 2

    log_format: LogFormat = proto.Field(
        proto.ENUM,
        number=1,
        enum=LogFormat,
    )


class MetadataManagementActivity(proto.Message):
    r"""The metadata management activities of the metastore service.

    Attributes:
        metadata_exports (MutableSequence[google.events.cloud.metastore_v1.types.MetadataExport]):
            Output only. The latest metadata exports of
            the metastore service.
        restores (MutableSequence[google.events.cloud.metastore_v1.types.Restore]):
            Output only. The latest restores of the
            metastore service.
    """

    metadata_exports: MutableSequence['MetadataExport'] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message='MetadataExport',
    )
    restores: MutableSequence['Restore'] = proto.RepeatedField(
        proto.MESSAGE,
        number=2,
        message='Restore',
    )


class MetadataImport(proto.Message):
    r"""A metastore resource that imports metadata.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        database_dump (google.events.cloud.metastore_v1.types.MetadataImport.DatabaseDump):
            Immutable. A database dump from a
            pre-existing metastore's database.

            This field is a member of `oneof`_ ``metadata``.
        name (str):
            Immutable. The relative resource name of the metadata
            import, of the form:

            ``projects/{project_number}/locations/{location_id}/services/{service_id}/metadataImports/{metadata_import_id}``.
        description (str):
            The description of the metadata import.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the metadata
            import was started.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the metadata
            import was last updated.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the metadata
            import finished.
        state (google.events.cloud.metastore_v1.types.MetadataImport.State):
            Output only. The current state of the
            metadata import.
    """
    class State(proto.Enum):
        r"""The current state of the metadata import.

        Values:
            STATE_UNSPECIFIED (0):
                The state of the metadata import is unknown.
            RUNNING (1):
                The metadata import is running.
            SUCCEEDED (2):
                The metadata import completed successfully.
            UPDATING (3):
                The metadata import is being updated.
            FAILED (4):
                The metadata import failed, and attempted
                metadata changes were rolled back.
        """
        STATE_UNSPECIFIED = 0
        RUNNING = 1
        SUCCEEDED = 2
        UPDATING = 3
        FAILED = 4

    class DatabaseDump(proto.Message):
        r"""A specification of the location of and metadata about a
        database dump from a relational database management system.

        Attributes:
            database_type (google.events.cloud.metastore_v1.types.MetadataImport.DatabaseDump.DatabaseType):
                The type of the database.
            gcs_uri (str):
                A Cloud Storage object or folder URI that specifies the
                source from which to import metadata. It must begin with
                ``gs://``.
            source_database (str):
                The name of the source database.
            type_ (google.events.cloud.metastore_v1.types.DatabaseDumpSpec.Type):
                Optional. The type of the database dump. If unspecified,
                defaults to ``MYSQL``.
        """
        class DatabaseType(proto.Enum):
            r"""The type of the database.

            Values:
                DATABASE_TYPE_UNSPECIFIED (0):
                    The type of the source database is unknown.
                MYSQL (1):
                    The type of the source database is MySQL.
            """
            DATABASE_TYPE_UNSPECIFIED = 0
            MYSQL = 1

        database_type: 'MetadataImport.DatabaseDump.DatabaseType' = proto.Field(
            proto.ENUM,
            number=1,
            enum='MetadataImport.DatabaseDump.DatabaseType',
        )
        gcs_uri: str = proto.Field(
            proto.STRING,
            number=2,
        )
        source_database: str = proto.Field(
            proto.STRING,
            number=3,
        )
        type_: 'DatabaseDumpSpec.Type' = proto.Field(
            proto.ENUM,
            number=4,
            enum='DatabaseDumpSpec.Type',
        )

    database_dump: DatabaseDump = proto.Field(
        proto.MESSAGE,
        number=6,
        oneof='metadata',
        message=DatabaseDump,
    )
    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    description: str = proto.Field(
        proto.STRING,
        number=2,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=5,
        enum=State,
    )


class MetadataExport(proto.Message):
    r"""The details of a metadata export operation.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        destination_gcs_uri (str):
            Output only. A Cloud Storage URI of a folder that metadata
            are exported to, in the form of
            ``gs://<bucket_name>/<path_inside_bucket>/<export_folder>``,
            where ``<export_folder>`` is automatically generated.

            This field is a member of `oneof`_ ``destination``.
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the export
            started.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the export ended.
        state (google.events.cloud.metastore_v1.types.MetadataExport.State):
            Output only. The current state of the export.
        database_dump_type (google.events.cloud.metastore_v1.types.DatabaseDumpSpec.Type):
            Output only. The type of the database dump.
    """
    class State(proto.Enum):
        r"""The current state of the metadata export.

        Values:
            STATE_UNSPECIFIED (0):
                The state of the metadata export is unknown.
            RUNNING (1):
                The metadata export is running.
            SUCCEEDED (2):
                The metadata export completed successfully.
            FAILED (3):
                The metadata export failed.
            CANCELLED (4):
                The metadata export is cancelled.
        """
        STATE_UNSPECIFIED = 0
        RUNNING = 1
        SUCCEEDED = 2
        FAILED = 3
        CANCELLED = 4

    destination_gcs_uri: str = proto.Field(
        proto.STRING,
        number=4,
        oneof='destination',
    )
    start_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=3,
        enum=State,
    )
    database_dump_type: 'DatabaseDumpSpec.Type' = proto.Field(
        proto.ENUM,
        number=5,
        enum='DatabaseDumpSpec.Type',
    )


class Backup(proto.Message):
    r"""The details of a backup resource.

    Attributes:
        name (str):
            Immutable. The relative resource name of the backup, in the
            following form:

            ``projects/{project_number}/locations/{location_id}/services/{service_id}/backups/{backup_id}``
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the backup was
            started.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the backup
            finished creating.
        state (google.events.cloud.metastore_v1.types.Backup.State):
            Output only. The current state of the backup.
        service_revision (google.events.cloud.metastore_v1.types.Service):
            Output only. The revision of the service at
            the time of backup.
        description (str):
            The description of the backup.
        restoring_services (MutableSequence[str]):
            Output only. Services that are restoring from
            the backup.
    """
    class State(proto.Enum):
        r"""The current state of the backup.

        Values:
            STATE_UNSPECIFIED (0):
                The state of the backup is unknown.
            CREATING (1):
                The backup is being created.
            DELETING (2):
                The backup is being deleted.
            ACTIVE (3):
                The backup is active and ready to use.
            FAILED (4):
                The backup failed.
            RESTORING (5):
                The backup is being restored.
        """
        STATE_UNSPECIFIED = 0
        CREATING = 1
        DELETING = 2
        ACTIVE = 3
        FAILED = 4
        RESTORING = 5

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=4,
        enum=State,
    )
    service_revision: 'Service' = proto.Field(
        proto.MESSAGE,
        number=5,
        message='Service',
    )
    description: str = proto.Field(
        proto.STRING,
        number=6,
    )
    restoring_services: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=7,
    )


class Restore(proto.Message):
    r"""The details of a metadata restore operation.

    Attributes:
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the restore
            started.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the restore ended.
        state (google.events.cloud.metastore_v1.types.Restore.State):
            Output only. The current state of the
            restore.
        backup (str):
            Output only. The relative resource name of the metastore
            service backup to restore from, in the following form:

            ``projects/{project_id}/locations/{location_id}/services/{service_id}/backups/{backup_id}``.
        type_ (google.events.cloud.metastore_v1.types.Restore.RestoreType):
            Output only. The type of restore.
        details (str):
            Output only. The restore details containing
            the revision of the service to be restored to,
            in format of JSON.
    """
    class State(proto.Enum):
        r"""The current state of the restore.

        Values:
            STATE_UNSPECIFIED (0):
                The state of the metadata restore is unknown.
            RUNNING (1):
                The metadata restore is running.
            SUCCEEDED (2):
                The metadata restore completed successfully.
            FAILED (3):
                The metadata restore failed.
            CANCELLED (4):
                The metadata restore is cancelled.
        """
        STATE_UNSPECIFIED = 0
        RUNNING = 1
        SUCCEEDED = 2
        FAILED = 3
        CANCELLED = 4

    class RestoreType(proto.Enum):
        r"""The type of restore. If unspecified, defaults to ``METADATA_ONLY``.

        Values:
            RESTORE_TYPE_UNSPECIFIED (0):
                The restore type is unknown.
            FULL (1):
                The service's metadata and configuration are
                restored.
            METADATA_ONLY (2):
                Only the service's metadata is restored.
        """
        RESTORE_TYPE_UNSPECIFIED = 0
        FULL = 1
        METADATA_ONLY = 2

    start_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=3,
        enum=State,
    )
    backup: str = proto.Field(
        proto.STRING,
        number=4,
    )
    type_: RestoreType = proto.Field(
        proto.ENUM,
        number=5,
        enum=RestoreType,
    )
    details: str = proto.Field(
        proto.STRING,
        number=6,
    )


class ScalingConfig(proto.Message):
    r"""Represents the scaling configuration of a metastore service.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        instance_size (google.events.cloud.metastore_v1.types.ScalingConfig.InstanceSize):
            An enum of readable instance sizes, with each instance size
            mapping to a float value (e.g. InstanceSize.EXTRA_SMALL =
            scaling_factor(0.1))

            This field is a member of `oneof`_ ``scaling_model``.
        scaling_factor (float):
            Scaling factor, increments of 0.1 for values
            less than 1.0, and increments of 1.0 for values
            greater than 1.0.

            This field is a member of `oneof`_ ``scaling_model``.
    """
    class InstanceSize(proto.Enum):
        r"""Metastore instance sizes.

        Values:
            INSTANCE_SIZE_UNSPECIFIED (0):
                Unspecified instance size
            EXTRA_SMALL (1):
                Extra small instance size, maps to a scaling
                factor of 0.1.
            SMALL (2):
                Small instance size, maps to a scaling factor
                of 0.5.
            MEDIUM (3):
                Medium instance size, maps to a scaling
                factor of 1.0.
            LARGE (4):
                Large instance size, maps to a scaling factor
                of 3.0.
            EXTRA_LARGE (5):
                Extra large instance size, maps to a scaling
                factor of 6.0.
        """
        INSTANCE_SIZE_UNSPECIFIED = 0
        EXTRA_SMALL = 1
        SMALL = 2
        MEDIUM = 3
        LARGE = 4
        EXTRA_LARGE = 5

    instance_size: InstanceSize = proto.Field(
        proto.ENUM,
        number=1,
        oneof='scaling_model',
        enum=InstanceSize,
    )
    scaling_factor: float = proto.Field(
        proto.FLOAT,
        number=2,
        oneof='scaling_model',
    )


class DatabaseDumpSpec(proto.Message):
    r"""The specification of database dump to import from or export
    to.

    """
    class Type(proto.Enum):
        r"""The type of the database dump.

        Values:
            TYPE_UNSPECIFIED (0):
                The type of the database dump is unknown.
            MYSQL (1):
                Database dump is a MySQL dump file.
            AVRO (2):
                Database dump contains Avro files.
        """
        TYPE_UNSPECIFIED = 0
        MYSQL = 1
        AVRO = 2


class MetadataImportEventData(proto.Message):
    r"""The data within all MetadataImport events.

    Attributes:
        payload (google.events.cloud.metastore_v1.types.MetadataImport):
            The MetadataImport event payload.
    """

    payload: 'MetadataImport' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='MetadataImport',
    )


class FederationEventData(proto.Message):
    r"""The data within all Federation events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.metastore_v1.types.Federation):
            Optional. The Federation event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Federation' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Federation',
    )


class BackupEventData(proto.Message):
    r"""The data within all Backup events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.metastore_v1.types.Backup):
            Optional. The Backup event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Backup' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Backup',
    )


class ServiceEventData(proto.Message):
    r"""The data within all Service events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.metastore_v1.types.Service):
            Optional. The Service event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Service' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Service',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
