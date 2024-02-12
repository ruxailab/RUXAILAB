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

from google.protobuf import duration_pb2  # type: ignore
from google.protobuf import timestamp_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.dataplex.v1',
    manifest={
        'State',
        'DataScanType',
        'Lake',
        'AssetStatus',
        'Zone',
        'Asset',
        'Environment',
        'Trigger',
        'DataSource',
        'ScannedData',
        'DataProfileSpec',
        'DataProfileResult',
        'DataQualitySpec',
        'DataQualityResult',
        'DataQualityRuleResult',
        'DataQualityDimensionResult',
        'DataQualityRule',
        'ResourceAccessSpec',
        'DataAccessSpec',
        'DataTaxonomy',
        'DataAttribute',
        'DataAttributeBinding',
        'DataScan',
        'Task',
        'Job',
        'TaskEventData',
        'ZoneEventData',
        'AssetEventData',
        'EnvironmentEventData',
        'DataTaxonomyEventData',
        'DataAttributeBindingEventData',
        'DataScanEventData',
        'LakeEventData',
        'DataAttributeEventData',
    },
)


class State(proto.Enum):
    r"""State of a resource.

    Values:
        STATE_UNSPECIFIED (0):
            State is not specified.
        ACTIVE (1):
            Resource is active, i.e., ready to use.
        CREATING (2):
            Resource is under creation.
        DELETING (3):
            Resource is under deletion.
        ACTION_REQUIRED (4):
            Resource is active but has unresolved
            actions.
    """
    STATE_UNSPECIFIED = 0
    ACTIVE = 1
    CREATING = 2
    DELETING = 3
    ACTION_REQUIRED = 4


class DataScanType(proto.Enum):
    r"""The type of DataScan.

    Values:
        DATA_SCAN_TYPE_UNSPECIFIED (0):
            The DataScan type is unspecified.
        DATA_QUALITY (1):
            Data Quality scan.
        DATA_PROFILE (2):
            Data Profile scan.
    """
    DATA_SCAN_TYPE_UNSPECIFIED = 0
    DATA_QUALITY = 1
    DATA_PROFILE = 2


class Lake(proto.Message):
    r"""A lake is a centralized repository for managing enterprise
    data across the organization distributed across many cloud
    projects, and stored in a variety of storage services such as
    Google Cloud Storage and BigQuery. The resources attached to a
    lake are referred to as managed resources. Data within these
    managed resources can be structured or unstructured. A lake
    provides data admins with tools to organize, secure and manage
    their data at scale, and provides data scientists and data
    engineers an integrated experience to easily search, discover,
    analyze and transform data and associated metadata.

    Attributes:
        name (str):
            Output only. The relative resource name of the lake, of the
            form:
            ``projects/{project_number}/locations/{location_id}/lakes/{lake_id}``.
        display_name (str):
            Optional. User friendly display name.
        uid (str):
            Output only. System generated globally unique
            ID for the lake. This ID will be different if
            the lake is deleted and re-created with the same
            name.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the lake was
            created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the lake was last
            updated.
        labels (MutableMapping[str, str]):
            Optional. User-defined labels for the lake.
        description (str):
            Optional. Description of the lake.
        state (google.events.cloud.dataplex_v1.types.State):
            Output only. Current state of the lake.
        service_account (str):
            Output only. Service account associated with
            this lake. This service account must be
            authorized to access or operate on resources
            managed by the lake.
        metastore (google.events.cloud.dataplex_v1.types.Lake.Metastore):
            Optional. Settings to manage lake and
            Dataproc Metastore service instance association.
        asset_status (google.events.cloud.dataplex_v1.types.AssetStatus):
            Output only. Aggregated status of the
            underlying assets of the lake.
        metastore_status (google.events.cloud.dataplex_v1.types.Lake.MetastoreStatus):
            Output only. Metastore status of the lake.
    """

    class Metastore(proto.Message):
        r"""Settings to manage association of Dataproc Metastore with a
        lake.

        Attributes:
            service (str):
                Optional. A relative reference to the Dataproc Metastore
                (https://cloud.google.com/dataproc-metastore/docs) service
                associated with the lake:
                ``projects/{project_id}/locations/{location_id}/services/{service_id}``
        """

        service: str = proto.Field(
            proto.STRING,
            number=1,
        )

    class MetastoreStatus(proto.Message):
        r"""Status of Lake and Dataproc Metastore service instance
        association.

        Attributes:
            state (google.events.cloud.dataplex_v1.types.Lake.MetastoreStatus.State):
                Current state of association.
            message (str):
                Additional information about the current
                status.
            update_time (google.protobuf.timestamp_pb2.Timestamp):
                Last update time of the metastore status of
                the lake.
            endpoint (str):
                The URI of the endpoint used to access the
                Metastore service.
        """
        class State(proto.Enum):
            r"""Current state of association.

            Values:
                STATE_UNSPECIFIED (0):
                    Unspecified.
                NONE (1):
                    A Metastore service instance is not
                    associated with the lake.
                READY (2):
                    A Metastore service instance is attached to
                    the lake.
                UPDATING (3):
                    Attach/detach is in progress.
                ERROR (4):
                    Attach/detach could not be done due to
                    errors.
            """
            STATE_UNSPECIFIED = 0
            NONE = 1
            READY = 2
            UPDATING = 3
            ERROR = 4

        state: 'Lake.MetastoreStatus.State' = proto.Field(
            proto.ENUM,
            number=1,
            enum='Lake.MetastoreStatus.State',
        )
        message: str = proto.Field(
            proto.STRING,
            number=2,
        )
        update_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=3,
            message=timestamp_pb2.Timestamp,
        )
        endpoint: str = proto.Field(
            proto.STRING,
            number=4,
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    uid: str = proto.Field(
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
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=6,
    )
    description: str = proto.Field(
        proto.STRING,
        number=7,
    )
    state: 'State' = proto.Field(
        proto.ENUM,
        number=8,
        enum='State',
    )
    service_account: str = proto.Field(
        proto.STRING,
        number=9,
    )
    metastore: Metastore = proto.Field(
        proto.MESSAGE,
        number=102,
        message=Metastore,
    )
    asset_status: 'AssetStatus' = proto.Field(
        proto.MESSAGE,
        number=103,
        message='AssetStatus',
    )
    metastore_status: MetastoreStatus = proto.Field(
        proto.MESSAGE,
        number=104,
        message=MetastoreStatus,
    )


class AssetStatus(proto.Message):
    r"""Aggregated status of the underlying assets of a lake or zone.

    Attributes:
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Last update time of the status.
        active_assets (int):
            Number of active assets.
        security_policy_applying_assets (int):
            Number of assets that are in process of
            updating the security policy on attached
            resources.
    """

    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    active_assets: int = proto.Field(
        proto.INT32,
        number=2,
    )
    security_policy_applying_assets: int = proto.Field(
        proto.INT32,
        number=3,
    )


class Zone(proto.Message):
    r"""A zone represents a logical group of related assets within a
    lake. A zone can be used to map to organizational structure or
    represent stages of data readiness from raw to curated. It
    provides managing behavior that is shared or inherited by all
    contained assets.

    Attributes:
        name (str):
            Output only. The relative resource name of the zone, of the
            form:
            ``projects/{project_number}/locations/{location_id}/lakes/{lake_id}/zones/{zone_id}``.
        display_name (str):
            Optional. User friendly display name.
        uid (str):
            Output only. System generated globally unique
            ID for the zone. This ID will be different if
            the zone is deleted and re-created with the same
            name.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the zone was
            created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the zone was last
            updated.
        labels (MutableMapping[str, str]):
            Optional. User defined labels for the zone.
        description (str):
            Optional. Description of the zone.
        state (google.events.cloud.dataplex_v1.types.State):
            Output only. Current state of the zone.
        type_ (google.events.cloud.dataplex_v1.types.Zone.Type):
            Required. Immutable. The type of the zone.
        discovery_spec (google.events.cloud.dataplex_v1.types.Zone.DiscoverySpec):
            Optional. Specification of the discovery
            feature applied to data in this zone.
        resource_spec (google.events.cloud.dataplex_v1.types.Zone.ResourceSpec):
            Required. Specification of the resources that
            are referenced by the assets within this zone.
        asset_status (google.events.cloud.dataplex_v1.types.AssetStatus):
            Output only. Aggregated status of the
            underlying assets of the zone.
    """
    class Type(proto.Enum):
        r"""Type of zone.

        Values:
            TYPE_UNSPECIFIED (0):
                Zone type not specified.
            RAW (1):
                A zone that contains data that needs further
                processing before it is considered generally
                ready for consumption and analytics workloads.
            CURATED (2):
                A zone that contains data that is considered
                to be ready for broader consumption and
                analytics workloads. Curated structured data
                stored in Cloud Storage must conform to certain
                file formats (parquet, avro and orc) and
                organized in a hive-compatible directory layout.
        """
        TYPE_UNSPECIFIED = 0
        RAW = 1
        CURATED = 2

    class ResourceSpec(proto.Message):
        r"""Settings for resources attached as assets within a zone.

        Attributes:
            location_type (google.events.cloud.dataplex_v1.types.Zone.ResourceSpec.LocationType):
                Required. Immutable. The location type of the
                resources that are allowed to be attached to the
                assets within this zone.
        """
        class LocationType(proto.Enum):
            r"""Location type of the resources attached to a zone.

            Values:
                LOCATION_TYPE_UNSPECIFIED (0):
                    Unspecified location type.
                SINGLE_REGION (1):
                    Resources that are associated with a single
                    region.
                MULTI_REGION (2):
                    Resources that are associated with a
                    multi-region location.
            """
            LOCATION_TYPE_UNSPECIFIED = 0
            SINGLE_REGION = 1
            MULTI_REGION = 2

        location_type: 'Zone.ResourceSpec.LocationType' = proto.Field(
            proto.ENUM,
            number=1,
            enum='Zone.ResourceSpec.LocationType',
        )

    class DiscoverySpec(proto.Message):
        r"""Settings to manage the metadata discovery and publishing in a
        zone.


        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            enabled (bool):
                Required. Whether discovery is enabled.
            include_patterns (MutableSequence[str]):
                Optional. The list of patterns to apply for
                selecting data to include during discovery if
                only a subset of the data should considered. For
                Cloud Storage bucket assets, these are
                interpreted as glob patterns used to match
                object names. For BigQuery dataset assets, these
                are interpreted as patterns to match table
                names.
            exclude_patterns (MutableSequence[str]):
                Optional. The list of patterns to apply for
                selecting data to exclude during discovery.  For
                Cloud Storage bucket assets, these are
                interpreted as glob patterns used to match
                object names. For BigQuery dataset assets, these
                are interpreted as patterns to match table
                names.
            csv_options (google.events.cloud.dataplex_v1.types.Zone.DiscoverySpec.CsvOptions):
                Optional. Configuration for CSV data.
            json_options (google.events.cloud.dataplex_v1.types.Zone.DiscoverySpec.JsonOptions):
                Optional. Configuration for Json data.
            schedule (str):
                Optional. Cron schedule (https://en.wikipedia.org/wiki/Cron)
                for running discovery periodically. Successive discovery
                runs must be scheduled at least 60 minutes apart. The
                default value is to run discovery every 60 minutes. To
                explicitly set a timezone to the cron tab, apply a prefix in
                the cron tab: "CRON_TZ=${IANA_TIME_ZONE}" or
                TZ=${IANA_TIME_ZONE}". The ${IANA_TIME_ZONE} may only be a
                valid string from IANA time zone database. For example,
                \`CRON_TZ=America/New_York 1

                -

                   -

                      -  \*\ ``, or``\ TZ=America/New_York 1 \* \* \* \*`.

                This field is a member of `oneof`_ ``trigger``.
        """

        class CsvOptions(proto.Message):
            r"""Describe CSV and similar semi-structured data formats.

            Attributes:
                header_rows (int):
                    Optional. The number of rows to interpret as
                    header rows that should be skipped when reading
                    data rows.
                delimiter (str):
                    Optional. The delimiter being used to
                    separate values. This defaults to ','.
                encoding (str):
                    Optional. The character encoding of the data.
                    The default is UTF-8.
                disable_type_inference (bool):
                    Optional. Whether to disable the inference of
                    data type for CSV data. If true, all columns
                    will be registered as strings.
            """

            header_rows: int = proto.Field(
                proto.INT32,
                number=1,
            )
            delimiter: str = proto.Field(
                proto.STRING,
                number=2,
            )
            encoding: str = proto.Field(
                proto.STRING,
                number=3,
            )
            disable_type_inference: bool = proto.Field(
                proto.BOOL,
                number=4,
            )

        class JsonOptions(proto.Message):
            r"""Describe JSON data format.

            Attributes:
                encoding (str):
                    Optional. The character encoding of the data.
                    The default is UTF-8.
                disable_type_inference (bool):
                    Optional. Whether to disable the inference of
                    data type for Json data. If true, all columns
                    will be registered as their primitive types
                    (strings, number or boolean).
            """

            encoding: str = proto.Field(
                proto.STRING,
                number=1,
            )
            disable_type_inference: bool = proto.Field(
                proto.BOOL,
                number=2,
            )

        enabled: bool = proto.Field(
            proto.BOOL,
            number=1,
        )
        include_patterns: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=2,
        )
        exclude_patterns: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=3,
        )
        csv_options: 'Zone.DiscoverySpec.CsvOptions' = proto.Field(
            proto.MESSAGE,
            number=4,
            message='Zone.DiscoverySpec.CsvOptions',
        )
        json_options: 'Zone.DiscoverySpec.JsonOptions' = proto.Field(
            proto.MESSAGE,
            number=5,
            message='Zone.DiscoverySpec.JsonOptions',
        )
        schedule: str = proto.Field(
            proto.STRING,
            number=10,
            oneof='trigger',
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    uid: str = proto.Field(
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
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=6,
    )
    description: str = proto.Field(
        proto.STRING,
        number=7,
    )
    state: 'State' = proto.Field(
        proto.ENUM,
        number=8,
        enum='State',
    )
    type_: Type = proto.Field(
        proto.ENUM,
        number=9,
        enum=Type,
    )
    discovery_spec: DiscoverySpec = proto.Field(
        proto.MESSAGE,
        number=103,
        message=DiscoverySpec,
    )
    resource_spec: ResourceSpec = proto.Field(
        proto.MESSAGE,
        number=104,
        message=ResourceSpec,
    )
    asset_status: 'AssetStatus' = proto.Field(
        proto.MESSAGE,
        number=105,
        message='AssetStatus',
    )


class Asset(proto.Message):
    r"""An asset represents a cloud resource that is being managed
    within a lake as a member of a zone.

    Attributes:
        name (str):
            Output only. The relative resource name of the asset, of the
            form:
            ``projects/{project_number}/locations/{location_id}/lakes/{lake_id}/zones/{zone_id}/assets/{asset_id}``.
        display_name (str):
            Optional. User friendly display name.
        uid (str):
            Output only. System generated globally unique
            ID for the asset. This ID will be different if
            the asset is deleted and re-created with the
            same name.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the asset was
            created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the asset was last
            updated.
        labels (MutableMapping[str, str]):
            Optional. User defined labels for the asset.
        description (str):
            Optional. Description of the asset.
        state (google.events.cloud.dataplex_v1.types.State):
            Output only. Current state of the asset.
        resource_spec (google.events.cloud.dataplex_v1.types.Asset.ResourceSpec):
            Required. Specification of the resource that
            is referenced by this asset.
        resource_status (google.events.cloud.dataplex_v1.types.Asset.ResourceStatus):
            Output only. Status of the resource
            referenced by this asset.
        security_status (google.events.cloud.dataplex_v1.types.Asset.SecurityStatus):
            Output only. Status of the security policy
            applied to resource referenced by this asset.
        discovery_spec (google.events.cloud.dataplex_v1.types.Asset.DiscoverySpec):
            Optional. Specification of the discovery
            feature applied to data referenced by this
            asset. When this spec is left unset, the asset
            will use the spec set on the parent zone.
        discovery_status (google.events.cloud.dataplex_v1.types.Asset.DiscoveryStatus):
            Output only. Status of the discovery feature
            applied to data referenced by this asset.
    """

    class SecurityStatus(proto.Message):
        r"""Security policy status of the asset. Data security policy,
        i.e., readers, writers & owners, should be specified in the
        lake/zone/asset IAM policy.

        Attributes:
            state (google.events.cloud.dataplex_v1.types.Asset.SecurityStatus.State):
                The current state of the security policy
                applied to the attached resource.
            message (str):
                Additional information about the current
                state.
            update_time (google.protobuf.timestamp_pb2.Timestamp):
                Last update time of the status.
        """
        class State(proto.Enum):
            r"""The state of the security policy.

            Values:
                STATE_UNSPECIFIED (0):
                    State unspecified.
                READY (1):
                    Security policy has been successfully applied
                    to the attached resource.
                APPLYING (2):
                    Security policy is in the process of being
                    applied to the attached resource.
                ERROR (3):
                    Security policy could not be applied to the
                    attached resource due to errors.
            """
            STATE_UNSPECIFIED = 0
            READY = 1
            APPLYING = 2
            ERROR = 3

        state: 'Asset.SecurityStatus.State' = proto.Field(
            proto.ENUM,
            number=1,
            enum='Asset.SecurityStatus.State',
        )
        message: str = proto.Field(
            proto.STRING,
            number=2,
        )
        update_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=3,
            message=timestamp_pb2.Timestamp,
        )

    class DiscoverySpec(proto.Message):
        r"""Settings to manage the metadata discovery and publishing for
        an asset.


        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            enabled (bool):
                Optional. Whether discovery is enabled.
            include_patterns (MutableSequence[str]):
                Optional. The list of patterns to apply for
                selecting data to include during discovery if
                only a subset of the data should considered.
                For Cloud Storage bucket assets, these are
                interpreted as glob patterns used to match
                object names. For BigQuery dataset assets, these
                are interpreted as patterns to match table
                names.
            exclude_patterns (MutableSequence[str]):
                Optional. The list of patterns to apply for
                selecting data to exclude during discovery.  For
                Cloud Storage bucket assets, these are
                interpreted as glob patterns used to match
                object names. For BigQuery dataset assets, these
                are interpreted as patterns to match table
                names.
            csv_options (google.events.cloud.dataplex_v1.types.Asset.DiscoverySpec.CsvOptions):
                Optional. Configuration for CSV data.
            json_options (google.events.cloud.dataplex_v1.types.Asset.DiscoverySpec.JsonOptions):
                Optional. Configuration for Json data.
            schedule (str):
                Optional. Cron schedule (https://en.wikipedia.org/wiki/Cron)
                for running discovery periodically. Successive discovery
                runs must be scheduled at least 60 minutes apart. The
                default value is to run discovery every 60 minutes. To
                explicitly set a timezone to the cron tab, apply a prefix in
                the cron tab: "CRON_TZ=${IANA_TIME_ZONE}" or
                TZ=${IANA_TIME_ZONE}". The ${IANA_TIME_ZONE} may only be a
                valid string from IANA time zone database. For example,
                \`CRON_TZ=America/New_York 1

                -

                   -

                      -  \*\ ``, or``\ TZ=America/New_York 1 \* \* \* \*`.

                This field is a member of `oneof`_ ``trigger``.
        """

        class CsvOptions(proto.Message):
            r"""Describe CSV and similar semi-structured data formats.

            Attributes:
                header_rows (int):
                    Optional. The number of rows to interpret as
                    header rows that should be skipped when reading
                    data rows.
                delimiter (str):
                    Optional. The delimiter being used to
                    separate values. This defaults to ','.
                encoding (str):
                    Optional. The character encoding of the data.
                    The default is UTF-8.
                disable_type_inference (bool):
                    Optional. Whether to disable the inference of
                    data type for CSV data. If true, all columns
                    will be registered as strings.
            """

            header_rows: int = proto.Field(
                proto.INT32,
                number=1,
            )
            delimiter: str = proto.Field(
                proto.STRING,
                number=2,
            )
            encoding: str = proto.Field(
                proto.STRING,
                number=3,
            )
            disable_type_inference: bool = proto.Field(
                proto.BOOL,
                number=4,
            )

        class JsonOptions(proto.Message):
            r"""Describe JSON data format.

            Attributes:
                encoding (str):
                    Optional. The character encoding of the data.
                    The default is UTF-8.
                disable_type_inference (bool):
                    Optional. Whether to disable the inference of
                    data type for Json data. If true, all columns
                    will be registered as their primitive types
                    (strings, number or boolean).
            """

            encoding: str = proto.Field(
                proto.STRING,
                number=1,
            )
            disable_type_inference: bool = proto.Field(
                proto.BOOL,
                number=2,
            )

        enabled: bool = proto.Field(
            proto.BOOL,
            number=1,
        )
        include_patterns: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=2,
        )
        exclude_patterns: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=3,
        )
        csv_options: 'Asset.DiscoverySpec.CsvOptions' = proto.Field(
            proto.MESSAGE,
            number=4,
            message='Asset.DiscoverySpec.CsvOptions',
        )
        json_options: 'Asset.DiscoverySpec.JsonOptions' = proto.Field(
            proto.MESSAGE,
            number=5,
            message='Asset.DiscoverySpec.JsonOptions',
        )
        schedule: str = proto.Field(
            proto.STRING,
            number=10,
            oneof='trigger',
        )

    class ResourceSpec(proto.Message):
        r"""Identifies the cloud resource that is referenced by this
        asset.

        Attributes:
            name (str):
                Immutable. Relative name of the cloud resource that contains
                the data that is being managed within a lake. For example:
                ``projects/{project_number}/buckets/{bucket_id}``
                ``projects/{project_number}/datasets/{dataset_id}``
            type_ (google.events.cloud.dataplex_v1.types.Asset.ResourceSpec.Type):
                Required. Immutable. Type of resource.
            read_access_mode (google.events.cloud.dataplex_v1.types.Asset.ResourceSpec.AccessMode):
                Optional. Determines how read permissions are
                handled for each asset and their associated
                tables. Only available to storage buckets
                assets.
        """
        class Type(proto.Enum):
            r"""Type of resource.

            Values:
                TYPE_UNSPECIFIED (0):
                    Type not specified.
                STORAGE_BUCKET (1):
                    Cloud Storage bucket.
                BIGQUERY_DATASET (2):
                    BigQuery dataset.
            """
            TYPE_UNSPECIFIED = 0
            STORAGE_BUCKET = 1
            BIGQUERY_DATASET = 2

        class AccessMode(proto.Enum):
            r"""Access Mode determines how data stored within the resource is
            read. This is only applicable to storage bucket assets.

            Values:
                ACCESS_MODE_UNSPECIFIED (0):
                    Access mode unspecified.
                DIRECT (1):
                    Default. Data is accessed directly using
                    storage APIs.
                MANAGED (2):
                    Data is accessed through a managed interface
                    using BigQuery APIs.
            """
            ACCESS_MODE_UNSPECIFIED = 0
            DIRECT = 1
            MANAGED = 2

        name: str = proto.Field(
            proto.STRING,
            number=1,
        )
        type_: 'Asset.ResourceSpec.Type' = proto.Field(
            proto.ENUM,
            number=2,
            enum='Asset.ResourceSpec.Type',
        )
        read_access_mode: 'Asset.ResourceSpec.AccessMode' = proto.Field(
            proto.ENUM,
            number=5,
            enum='Asset.ResourceSpec.AccessMode',
        )

    class ResourceStatus(proto.Message):
        r"""Status of the resource referenced by an asset.

        Attributes:
            state (google.events.cloud.dataplex_v1.types.Asset.ResourceStatus.State):
                The current state of the managed resource.
            message (str):
                Additional information about the current
                state.
            update_time (google.protobuf.timestamp_pb2.Timestamp):
                Last update time of the status.
            managed_access_identity (str):
                Output only. Service account associated with
                the BigQuery Connection.
        """
        class State(proto.Enum):
            r"""The state of a resource.

            Values:
                STATE_UNSPECIFIED (0):
                    State unspecified.
                READY (1):
                    Resource does not have any errors.
                ERROR (2):
                    Resource has errors.
            """
            STATE_UNSPECIFIED = 0
            READY = 1
            ERROR = 2

        state: 'Asset.ResourceStatus.State' = proto.Field(
            proto.ENUM,
            number=1,
            enum='Asset.ResourceStatus.State',
        )
        message: str = proto.Field(
            proto.STRING,
            number=2,
        )
        update_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=3,
            message=timestamp_pb2.Timestamp,
        )
        managed_access_identity: str = proto.Field(
            proto.STRING,
            number=4,
        )

    class DiscoveryStatus(proto.Message):
        r"""Status of discovery for an asset.

        Attributes:
            state (google.events.cloud.dataplex_v1.types.Asset.DiscoveryStatus.State):
                The current status of the discovery feature.
            message (str):
                Additional information about the current
                state.
            update_time (google.protobuf.timestamp_pb2.Timestamp):
                Last update time of the status.
            last_run_time (google.protobuf.timestamp_pb2.Timestamp):
                The start time of the last discovery run.
            stats (google.events.cloud.dataplex_v1.types.Asset.DiscoveryStatus.Stats):
                Data Stats of the asset reported by
                discovery.
            last_run_duration (google.protobuf.duration_pb2.Duration):
                The duration of the last discovery run.
        """
        class State(proto.Enum):
            r"""Current state of discovery.

            Values:
                STATE_UNSPECIFIED (0):
                    State is unspecified.
                SCHEDULED (1):
                    Discovery for the asset is scheduled.
                IN_PROGRESS (2):
                    Discovery for the asset is running.
                PAUSED (3):
                    Discovery for the asset is currently paused
                    (e.g. due to a lack of available resources). It
                    will be automatically resumed.
                DISABLED (5):
                    Discovery for the asset is disabled.
            """
            STATE_UNSPECIFIED = 0
            SCHEDULED = 1
            IN_PROGRESS = 2
            PAUSED = 3
            DISABLED = 5

        class Stats(proto.Message):
            r"""The aggregated data statistics for the asset reported by
            discovery.

            Attributes:
                data_items (int):
                    The count of data items within the referenced
                    resource.
                data_size (int):
                    The number of stored data bytes within the
                    referenced resource.
                tables (int):
                    The count of table entities within the
                    referenced resource.
                filesets (int):
                    The count of fileset entities within the
                    referenced resource.
            """

            data_items: int = proto.Field(
                proto.INT64,
                number=1,
            )
            data_size: int = proto.Field(
                proto.INT64,
                number=2,
            )
            tables: int = proto.Field(
                proto.INT64,
                number=3,
            )
            filesets: int = proto.Field(
                proto.INT64,
                number=4,
            )

        state: 'Asset.DiscoveryStatus.State' = proto.Field(
            proto.ENUM,
            number=1,
            enum='Asset.DiscoveryStatus.State',
        )
        message: str = proto.Field(
            proto.STRING,
            number=2,
        )
        update_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=3,
            message=timestamp_pb2.Timestamp,
        )
        last_run_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=4,
            message=timestamp_pb2.Timestamp,
        )
        stats: 'Asset.DiscoveryStatus.Stats' = proto.Field(
            proto.MESSAGE,
            number=6,
            message='Asset.DiscoveryStatus.Stats',
        )
        last_run_duration: duration_pb2.Duration = proto.Field(
            proto.MESSAGE,
            number=7,
            message=duration_pb2.Duration,
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    uid: str = proto.Field(
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
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=6,
    )
    description: str = proto.Field(
        proto.STRING,
        number=7,
    )
    state: 'State' = proto.Field(
        proto.ENUM,
        number=8,
        enum='State',
    )
    resource_spec: ResourceSpec = proto.Field(
        proto.MESSAGE,
        number=100,
        message=ResourceSpec,
    )
    resource_status: ResourceStatus = proto.Field(
        proto.MESSAGE,
        number=101,
        message=ResourceStatus,
    )
    security_status: SecurityStatus = proto.Field(
        proto.MESSAGE,
        number=103,
        message=SecurityStatus,
    )
    discovery_spec: DiscoverySpec = proto.Field(
        proto.MESSAGE,
        number=106,
        message=DiscoverySpec,
    )
    discovery_status: DiscoveryStatus = proto.Field(
        proto.MESSAGE,
        number=107,
        message=DiscoveryStatus,
    )


class Environment(proto.Message):
    r"""Environment represents a user-visible compute infrastructure
    for analytics within a lake.

    Attributes:
        name (str):
            Output only. The relative resource name of the environment,
            of the form:
            projects/{project_id}/locations/{location_id}/lakes/{lake_id}/environment/{environment_id}
        display_name (str):
            Optional. User friendly display name.
        uid (str):
            Output only. System generated globally unique
            ID for the environment. This ID will be
            different if the environment is deleted and
            re-created with the same name.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Environment creation time.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the environment
            was last updated.
        labels (MutableMapping[str, str]):
            Optional. User defined labels for the
            environment.
        description (str):
            Optional. Description of the environment.
        state (google.events.cloud.dataplex_v1.types.State):
            Output only. Current state of the
            environment.
        infrastructure_spec (google.events.cloud.dataplex_v1.types.Environment.InfrastructureSpec):
            Required. Infrastructure specification for
            the Environment.
        session_spec (google.events.cloud.dataplex_v1.types.Environment.SessionSpec):
            Optional. Configuration for sessions created
            for this environment.
        session_status (google.events.cloud.dataplex_v1.types.Environment.SessionStatus):
            Output only. Status of sessions created for
            this environment.
        endpoints (google.events.cloud.dataplex_v1.types.Environment.Endpoints):
            Output only. URI Endpoints to access sessions
            associated with the Environment.
    """

    class InfrastructureSpec(proto.Message):
        r"""Configuration for the underlying infrastructure used to run
        workloads.


        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            compute (google.events.cloud.dataplex_v1.types.Environment.InfrastructureSpec.ComputeResources):
                Optional. Compute resources needed for
                analyze interactive workloads.

                This field is a member of `oneof`_ ``resources``.
            os_image (google.events.cloud.dataplex_v1.types.Environment.InfrastructureSpec.OsImageRuntime):
                Required. Software Runtime Configuration for
                analyze interactive workloads.

                This field is a member of `oneof`_ ``runtime``.
        """

        class ComputeResources(proto.Message):
            r"""Compute resources associated with the analyze interactive
            workloads.

            Attributes:
                disk_size_gb (int):
                    Optional. Size in GB of the disk. Default is
                    100 GB.
                node_count (int):
                    Optional. Total number of nodes in the
                    sessions created for this environment.
                max_node_count (int):
                    Optional. Max configurable nodes. If max_node_count >
                    node_count, then auto-scaling is enabled.
            """

            disk_size_gb: int = proto.Field(
                proto.INT32,
                number=1,
            )
            node_count: int = proto.Field(
                proto.INT32,
                number=2,
            )
            max_node_count: int = proto.Field(
                proto.INT32,
                number=3,
            )

        class OsImageRuntime(proto.Message):
            r"""Software Runtime Configuration to run Analyze.

            Attributes:
                image_version (str):
                    Required. Dataplex Image version.
                java_libraries (MutableSequence[str]):
                    Optional. List of Java jars to be included in
                    the runtime environment. Valid input includes
                    Cloud Storage URIs to Jar binaries. For example,
                    gs://bucket-name/my/path/to/file.jar
                python_packages (MutableSequence[str]):
                    Optional. A list of python packages to be
                    installed. Valid formats include Cloud Storage
                    URI to a PIP installable library. For example,
                    gs://bucket-name/my/path/to/lib.tar.gz
                properties (MutableMapping[str, str]):
                    Optional. Spark properties to provide configuration for use
                    in sessions created for this environment. The properties to
                    set on daemon config files. Property keys are specified in
                    ``prefix:property`` format. The prefix must be "spark".
            """

            image_version: str = proto.Field(
                proto.STRING,
                number=1,
            )
            java_libraries: MutableSequence[str] = proto.RepeatedField(
                proto.STRING,
                number=2,
            )
            python_packages: MutableSequence[str] = proto.RepeatedField(
                proto.STRING,
                number=3,
            )
            properties: MutableMapping[str, str] = proto.MapField(
                proto.STRING,
                proto.STRING,
                number=4,
            )

        compute: 'Environment.InfrastructureSpec.ComputeResources' = proto.Field(
            proto.MESSAGE,
            number=50,
            oneof='resources',
            message='Environment.InfrastructureSpec.ComputeResources',
        )
        os_image: 'Environment.InfrastructureSpec.OsImageRuntime' = proto.Field(
            proto.MESSAGE,
            number=100,
            oneof='runtime',
            message='Environment.InfrastructureSpec.OsImageRuntime',
        )

    class SessionSpec(proto.Message):
        r"""Configuration for sessions created for this environment.

        Attributes:
            max_idle_duration (google.protobuf.duration_pb2.Duration):
                Optional. The idle time configuration of the
                session. The session will be auto-terminated at
                the end of this period.
            enable_fast_startup (bool):
                Optional. If True, this causes sessions to be
                pre-created and available for faster startup to
                enable interactive exploration use-cases. This
                defaults to False to avoid additional billed
                charges. These can only be set to True for the
                environment with name set to "default", and with
                default configuration.
        """

        max_idle_duration: duration_pb2.Duration = proto.Field(
            proto.MESSAGE,
            number=1,
            message=duration_pb2.Duration,
        )
        enable_fast_startup: bool = proto.Field(
            proto.BOOL,
            number=2,
        )

    class SessionStatus(proto.Message):
        r"""Status of sessions created for this environment.

        Attributes:
            active (bool):
                Output only. Queries over sessions to mark
                whether the environment is currently active or
                not
        """

        active: bool = proto.Field(
            proto.BOOL,
            number=1,
        )

    class Endpoints(proto.Message):
        r"""URI Endpoints to access sessions associated with the
        Environment.

        Attributes:
            notebooks (str):
                Output only. URI to serve notebook APIs
            sql (str):
                Output only. URI to serve SQL APIs
        """

        notebooks: str = proto.Field(
            proto.STRING,
            number=1,
        )
        sql: str = proto.Field(
            proto.STRING,
            number=2,
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    uid: str = proto.Field(
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
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=6,
    )
    description: str = proto.Field(
        proto.STRING,
        number=7,
    )
    state: 'State' = proto.Field(
        proto.ENUM,
        number=8,
        enum='State',
    )
    infrastructure_spec: InfrastructureSpec = proto.Field(
        proto.MESSAGE,
        number=100,
        message=InfrastructureSpec,
    )
    session_spec: SessionSpec = proto.Field(
        proto.MESSAGE,
        number=101,
        message=SessionSpec,
    )
    session_status: SessionStatus = proto.Field(
        proto.MESSAGE,
        number=102,
        message=SessionStatus,
    )
    endpoints: Endpoints = proto.Field(
        proto.MESSAGE,
        number=200,
        message=Endpoints,
    )


class Trigger(proto.Message):
    r"""DataScan scheduling and trigger settings.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        on_demand (google.events.cloud.dataplex_v1.types.Trigger.OnDemand):
            The scan runs once via ``RunDataScan`` API.

            This field is a member of `oneof`_ ``mode``.
        schedule (google.events.cloud.dataplex_v1.types.Trigger.Schedule):
            The scan is scheduled to run periodically.

            This field is a member of `oneof`_ ``mode``.
    """

    class OnDemand(proto.Message):
        r"""The scan runs once via ``RunDataScan`` API.
        """

    class Schedule(proto.Message):
        r"""The scan is scheduled to run periodically.

        Attributes:
            cron (str):
                Required. `Cron <https://en.wikipedia.org/wiki/Cron>`__
                schedule for running scans periodically.

                To explicitly set a timezone in the cron tab, apply a prefix
                in the cron tab: **"CRON_TZ=${IANA_TIME_ZONE}"** or
                **"TZ=${IANA_TIME_ZONE}"**. The **${IANA_TIME_ZONE}** may
                only be a valid string from IANA time zone database
                (`wikipedia <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List>`__).
                For example, ``CRON_TZ=America/New_York 1 * * * *``, or
                ``TZ=America/New_York 1 * * * *``.

                This field is required for Schedule scans.
        """

        cron: str = proto.Field(
            proto.STRING,
            number=1,
        )

    on_demand: OnDemand = proto.Field(
        proto.MESSAGE,
        number=100,
        oneof='mode',
        message=OnDemand,
    )
    schedule: Schedule = proto.Field(
        proto.MESSAGE,
        number=101,
        oneof='mode',
        message=Schedule,
    )


class DataSource(proto.Message):
    r"""The data source for DataScan.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        entity (str):
            Immutable. The Dataplex entity that represents the data
            source (e.g. BigQuery table) for DataScan, of the form:
            ``projects/{project_number}/locations/{location_id}/lakes/{lake_id}/zones/{zone_id}/entities/{entity_id}``.

            This field is a member of `oneof`_ ``source``.
    """

    entity: str = proto.Field(
        proto.STRING,
        number=100,
        oneof='source',
    )


class ScannedData(proto.Message):
    r"""The data scanned during processing (e.g. in incremental
    DataScan)


    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        incremental_field (google.events.cloud.dataplex_v1.types.ScannedData.IncrementalField):
            The range denoted by values of an incremental
            field

            This field is a member of `oneof`_ ``data_range``.
    """

    class IncrementalField(proto.Message):
        r"""A data range denoted by a pair of start/end values of a
        field.

        Attributes:
            field (str):
                The field that contains values which
                monotonically increases over time (e.g. a
                timestamp column).
            start (str):
                Value that marks the start of the range.
            end (str):
                Value that marks the end of the range.
        """

        field: str = proto.Field(
            proto.STRING,
            number=1,
        )
        start: str = proto.Field(
            proto.STRING,
            number=2,
        )
        end: str = proto.Field(
            proto.STRING,
            number=3,
        )

    incremental_field: IncrementalField = proto.Field(
        proto.MESSAGE,
        number=1,
        oneof='data_range',
        message=IncrementalField,
    )


class DataProfileSpec(proto.Message):
    r"""DataProfileScan related setting.
    """


class DataProfileResult(proto.Message):
    r"""DataProfileResult defines the output of DataProfileScan. Each
    field of the table will have field type specific profile result.

    Attributes:
        row_count (int):
            The count of rows scanned.
        profile (google.events.cloud.dataplex_v1.types.DataProfileResult.Profile):
            The profile information per field.
        scanned_data (google.events.cloud.dataplex_v1.types.ScannedData):
            The data scanned for this result.
    """

    class Profile(proto.Message):
        r"""Contains name, type, mode and field type specific profile
        information.

        Attributes:
            fields (MutableSequence[google.events.cloud.dataplex_v1.types.DataProfileResult.Profile.Field]):
                List of fields with structural and profile
                information for each field.
        """

        class Field(proto.Message):
            r"""A field within a table.

            Attributes:
                name (str):
                    The name of the field.
                type_ (str):
                    The field data type. Possible values include:

                    -  STRING
                    -  BYTE
                    -  INT64
                    -  INT32
                    -  INT16
                    -  DOUBLE
                    -  FLOAT
                    -  DECIMAL
                    -  BOOLEAN
                    -  BINARY
                    -  TIMESTAMP
                    -  DATE
                    -  TIME
                    -  NULL
                    -  RECORD
                mode (str):
                    The mode of the field. Possible values include:

                    -  REQUIRED, if it is a required field.
                    -  NULLABLE, if it is an optional field.
                    -  REPEATED, if it is a repeated field.
                profile (google.events.cloud.dataplex_v1.types.DataProfileResult.Profile.Field.ProfileInfo):
                    Profile information for the corresponding
                    field.
            """

            class ProfileInfo(proto.Message):
                r"""The profile information for each field type.

                This message has `oneof`_ fields (mutually exclusive fields).
                For each oneof, at most one member field can be set at the same time.
                Setting any member of the oneof automatically clears all other
                members.

                .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

                Attributes:
                    null_ratio (float):
                        Ratio of rows with null value against total
                        scanned rows.
                    distinct_ratio (float):
                        Ratio of rows with distinct values against
                        total scanned rows. Not available for complex
                        non-groupable field type RECORD and fields with
                        REPEATABLE mode.
                    top_n_values (MutableSequence[google.events.cloud.dataplex_v1.types.DataProfileResult.Profile.Field.ProfileInfo.TopNValue]):
                        The list of top N non-null values and number
                        of times they occur in the scanned data. N is 10
                        or equal to the number of distinct values in the
                        field, whichever is smaller. Not available for
                        complex non-groupable field type RECORD and
                        fields with REPEATABLE mode.
                    string_profile (google.events.cloud.dataplex_v1.types.DataProfileResult.Profile.Field.ProfileInfo.StringFieldInfo):
                        String type field information.

                        This field is a member of `oneof`_ ``field_info``.
                    integer_profile (google.events.cloud.dataplex_v1.types.DataProfileResult.Profile.Field.ProfileInfo.IntegerFieldInfo):
                        Integer type field information.

                        This field is a member of `oneof`_ ``field_info``.
                    double_profile (google.events.cloud.dataplex_v1.types.DataProfileResult.Profile.Field.ProfileInfo.DoubleFieldInfo):
                        Double type field information.

                        This field is a member of `oneof`_ ``field_info``.
                """

                class StringFieldInfo(proto.Message):
                    r"""The profile information for a string type field.

                    Attributes:
                        min_length (int):
                            Minimum length of non-null values in the
                            scanned data.
                        max_length (int):
                            Maximum length of non-null values in the
                            scanned data.
                        average_length (float):
                            Average length of non-null values in the
                            scanned data.
                    """

                    min_length: int = proto.Field(
                        proto.INT64,
                        number=1,
                    )
                    max_length: int = proto.Field(
                        proto.INT64,
                        number=2,
                    )
                    average_length: float = proto.Field(
                        proto.DOUBLE,
                        number=3,
                    )

                class IntegerFieldInfo(proto.Message):
                    r"""The profile information for an integer type field.

                    Attributes:
                        average (float):
                            Average of non-null values in the scanned
                            data. NaN, if the field has a NaN.
                        standard_deviation (float):
                            Standard deviation of non-null values in the
                            scanned data. NaN, if the field has a NaN.
                        min_ (int):
                            Minimum of non-null values in the scanned
                            data. NaN, if the field has a NaN.
                        quartiles (MutableSequence[int]):
                            A quartile divides the number of data points
                            into four parts, or quarters, of more-or-less
                            equal size. Three main quartiles used are: The
                            first quartile (Q1) splits off the lowest 25% of
                            data from the highest 75%. It is also known as
                            the lower or 25th empirical quartile, as 25% of
                            the data is below this point. The second
                            quartile (Q2) is the median of a data set. So,
                            50% of the data lies below this point. The third
                            quartile (Q3) splits off the highest 25% of data
                            from the lowest 75%. It is known as the upper or
                            75th empirical quartile, as 75% of the data lies
                            below this point. Here, the quartiles is
                            provided as an ordered list of quartile values
                            for the scanned data, occurring in order Q1,
                            median, Q3.
                        max_ (int):
                            Maximum of non-null values in the scanned
                            data. NaN, if the field has a NaN.
                    """

                    average: float = proto.Field(
                        proto.DOUBLE,
                        number=1,
                    )
                    standard_deviation: float = proto.Field(
                        proto.DOUBLE,
                        number=3,
                    )
                    min_: int = proto.Field(
                        proto.INT64,
                        number=4,
                    )
                    quartiles: MutableSequence[int] = proto.RepeatedField(
                        proto.INT64,
                        number=6,
                    )
                    max_: int = proto.Field(
                        proto.INT64,
                        number=5,
                    )

                class DoubleFieldInfo(proto.Message):
                    r"""The profile information for a double type field.

                    Attributes:
                        average (float):
                            Average of non-null values in the scanned
                            data. NaN, if the field has a NaN.
                        standard_deviation (float):
                            Standard deviation of non-null values in the
                            scanned data. NaN, if the field has a NaN.
                        min_ (float):
                            Minimum of non-null values in the scanned
                            data. NaN, if the field has a NaN.
                        quartiles (MutableSequence[float]):
                            A quartile divides the number of data points
                            into four parts, or quarters, of more-or-less
                            equal size. Three main quartiles used are: The
                            first quartile (Q1) splits off the lowest 25% of
                            data from the highest 75%. It is also known as
                            the lower or 25th empirical quartile, as 25% of
                            the data is below this point. The second
                            quartile (Q2) is the median of a data set. So,
                            50% of the data lies below this point. The third
                            quartile (Q3) splits off the highest 25% of data
                            from the lowest 75%. It is known as the upper or
                            75th empirical quartile, as 75% of the data lies
                            below this point. Here, the quartiles is
                            provided as an ordered list of quartile values
                            for the scanned data, occurring in order Q1,
                            median, Q3.
                        max_ (float):
                            Maximum of non-null values in the scanned
                            data. NaN, if the field has a NaN.
                    """

                    average: float = proto.Field(
                        proto.DOUBLE,
                        number=1,
                    )
                    standard_deviation: float = proto.Field(
                        proto.DOUBLE,
                        number=3,
                    )
                    min_: float = proto.Field(
                        proto.DOUBLE,
                        number=4,
                    )
                    quartiles: MutableSequence[float] = proto.RepeatedField(
                        proto.DOUBLE,
                        number=6,
                    )
                    max_: float = proto.Field(
                        proto.DOUBLE,
                        number=5,
                    )

                class TopNValue(proto.Message):
                    r"""Top N non-null values in the scanned data.

                    Attributes:
                        value (str):
                            String value of a top N non-null value.
                        count (int):
                            Count of the corresponding value in the
                            scanned data.
                    """

                    value: str = proto.Field(
                        proto.STRING,
                        number=1,
                    )
                    count: int = proto.Field(
                        proto.INT64,
                        number=2,
                    )

                null_ratio: float = proto.Field(
                    proto.DOUBLE,
                    number=2,
                )
                distinct_ratio: float = proto.Field(
                    proto.DOUBLE,
                    number=3,
                )
                top_n_values: MutableSequence['DataProfileResult.Profile.Field.ProfileInfo.TopNValue'] = proto.RepeatedField(
                    proto.MESSAGE,
                    number=4,
                    message='DataProfileResult.Profile.Field.ProfileInfo.TopNValue',
                )
                string_profile: 'DataProfileResult.Profile.Field.ProfileInfo.StringFieldInfo' = proto.Field(
                    proto.MESSAGE,
                    number=101,
                    oneof='field_info',
                    message='DataProfileResult.Profile.Field.ProfileInfo.StringFieldInfo',
                )
                integer_profile: 'DataProfileResult.Profile.Field.ProfileInfo.IntegerFieldInfo' = proto.Field(
                    proto.MESSAGE,
                    number=102,
                    oneof='field_info',
                    message='DataProfileResult.Profile.Field.ProfileInfo.IntegerFieldInfo',
                )
                double_profile: 'DataProfileResult.Profile.Field.ProfileInfo.DoubleFieldInfo' = proto.Field(
                    proto.MESSAGE,
                    number=103,
                    oneof='field_info',
                    message='DataProfileResult.Profile.Field.ProfileInfo.DoubleFieldInfo',
                )

            name: str = proto.Field(
                proto.STRING,
                number=1,
            )
            type_: str = proto.Field(
                proto.STRING,
                number=2,
            )
            mode: str = proto.Field(
                proto.STRING,
                number=3,
            )
            profile: 'DataProfileResult.Profile.Field.ProfileInfo' = proto.Field(
                proto.MESSAGE,
                number=4,
                message='DataProfileResult.Profile.Field.ProfileInfo',
            )

        fields: MutableSequence['DataProfileResult.Profile.Field'] = proto.RepeatedField(
            proto.MESSAGE,
            number=2,
            message='DataProfileResult.Profile.Field',
        )

    row_count: int = proto.Field(
        proto.INT64,
        number=3,
    )
    profile: Profile = proto.Field(
        proto.MESSAGE,
        number=4,
        message=Profile,
    )
    scanned_data: 'ScannedData' = proto.Field(
        proto.MESSAGE,
        number=5,
        message='ScannedData',
    )


class DataQualitySpec(proto.Message):
    r"""DataQualityScan related setting.

    Attributes:
        rules (MutableSequence[google.events.cloud.dataplex_v1.types.DataQualityRule]):
            The list of rules to evaluate against a data
            source. At least one rule is required.
    """

    rules: MutableSequence['DataQualityRule'] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message='DataQualityRule',
    )


class DataQualityResult(proto.Message):
    r"""The output of a DataQualityScan.

    Attributes:
        passed (bool):
            Overall data quality result -- ``true`` if all rules passed.
        dimensions (MutableSequence[google.events.cloud.dataplex_v1.types.DataQualityDimensionResult]):
            A list of results at the dimension level.
        rules (MutableSequence[google.events.cloud.dataplex_v1.types.DataQualityRuleResult]):
            A list of all the rules in a job, and their
            results.
        row_count (int):
            The count of rows processed.
        scanned_data (google.events.cloud.dataplex_v1.types.ScannedData):
            The data scanned for this result.
    """

    passed: bool = proto.Field(
        proto.BOOL,
        number=5,
    )
    dimensions: MutableSequence['DataQualityDimensionResult'] = proto.RepeatedField(
        proto.MESSAGE,
        number=2,
        message='DataQualityDimensionResult',
    )
    rules: MutableSequence['DataQualityRuleResult'] = proto.RepeatedField(
        proto.MESSAGE,
        number=3,
        message='DataQualityRuleResult',
    )
    row_count: int = proto.Field(
        proto.INT64,
        number=4,
    )
    scanned_data: 'ScannedData' = proto.Field(
        proto.MESSAGE,
        number=7,
        message='ScannedData',
    )


class DataQualityRuleResult(proto.Message):
    r"""DataQualityRuleResult provides a more detailed, per-rule view
    of the results.

    Attributes:
        rule (google.events.cloud.dataplex_v1.types.DataQualityRule):
            The rule specified in the DataQualitySpec, as
            is.
        passed (bool):
            Whether the rule passed or failed.
        evaluated_count (int):
            The number of rows a rule was evaluated against. This field
            is only valid for ColumnMap type rules.

            Evaluated count can be configured to either

            -  include all rows (default) - with ``null`` rows
               automatically failing rule evaluation, or
            -  exclude ``null`` rows from the ``evaluated_count``, by
               setting ``ignore_nulls = true``.
        passed_count (int):
            The number of rows which passed a rule
            evaluation. This field is only valid for
            ColumnMap type rules.
        null_count (int):
            The number of rows with null values in the
            specified column.
        pass_ratio (float):
            The ratio of **passed_count / evaluated_count**. This field
            is only valid for ColumnMap type rules.
        failing_rows_query (str):
            The query to find rows that did not pass this
            rule. Only applies to ColumnMap and RowCondition
            rules.
    """

    rule: 'DataQualityRule' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='DataQualityRule',
    )
    passed: bool = proto.Field(
        proto.BOOL,
        number=7,
    )
    evaluated_count: int = proto.Field(
        proto.INT64,
        number=9,
    )
    passed_count: int = proto.Field(
        proto.INT64,
        number=8,
    )
    null_count: int = proto.Field(
        proto.INT64,
        number=5,
    )
    pass_ratio: float = proto.Field(
        proto.DOUBLE,
        number=6,
    )
    failing_rows_query: str = proto.Field(
        proto.STRING,
        number=10,
    )


class DataQualityDimensionResult(proto.Message):
    r"""DataQualityDimensionResult provides a more detailed,
    per-dimension view of the results.

    Attributes:
        passed (bool):
            Whether the dimension passed or failed.
    """

    passed: bool = proto.Field(
        proto.BOOL,
        number=3,
    )


class DataQualityRule(proto.Message):
    r"""A rule captures data quality intent about a data source.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        range_expectation (google.events.cloud.dataplex_v1.types.DataQualityRule.RangeExpectation):
            ColumnMap rule which evaluates whether each
            column value lies between a specified range.

            This field is a member of `oneof`_ ``rule_type``.
        non_null_expectation (google.events.cloud.dataplex_v1.types.DataQualityRule.NonNullExpectation):
            ColumnMap rule which evaluates whether each
            column value is null.

            This field is a member of `oneof`_ ``rule_type``.
        set_expectation (google.events.cloud.dataplex_v1.types.DataQualityRule.SetExpectation):
            ColumnMap rule which evaluates whether each
            column value is contained by a specified set.

            This field is a member of `oneof`_ ``rule_type``.
        regex_expectation (google.events.cloud.dataplex_v1.types.DataQualityRule.RegexExpectation):
            ColumnMap rule which evaluates whether each
            column value matches a specified regex.

            This field is a member of `oneof`_ ``rule_type``.
        uniqueness_expectation (google.events.cloud.dataplex_v1.types.DataQualityRule.UniquenessExpectation):
            ColumnAggregate rule which evaluates whether
            the column has duplicates.

            This field is a member of `oneof`_ ``rule_type``.
        statistic_range_expectation (google.events.cloud.dataplex_v1.types.DataQualityRule.StatisticRangeExpectation):
            ColumnAggregate rule which evaluates whether
            the column aggregate statistic lies between a
            specified range.

            This field is a member of `oneof`_ ``rule_type``.
        row_condition_expectation (google.events.cloud.dataplex_v1.types.DataQualityRule.RowConditionExpectation):
            Table rule which evaluates whether each row
            passes the specified condition.

            This field is a member of `oneof`_ ``rule_type``.
        table_condition_expectation (google.events.cloud.dataplex_v1.types.DataQualityRule.TableConditionExpectation):
            Table rule which evaluates whether the
            provided expression is true.

            This field is a member of `oneof`_ ``rule_type``.
        column (str):
            Optional. The unnested column which this rule
            is evaluated against.
        ignore_null (bool):
            Optional. Rows with ``null`` values will automatically fail
            a rule, unless ``ignore_null`` is ``true``. In that case,
            such ``null`` rows are trivially considered passing.

            Only applicable to ColumnMap rules.
        dimension (str):
            Required. The dimension a rule belongs to. Results are also
            aggregated at the dimension level. Supported dimensions are
            **["COMPLETENESS", "ACCURACY", "CONSISTENCY", "VALIDITY",
            "UNIQUENESS", "INTEGRITY"]**
        threshold (float):
            Optional. The minimum ratio of **passing_rows / total_rows**
            required to pass this rule, with a range of [0.0, 1.0].

            0 indicates default value (i.e. 1.0).
    """

    class RangeExpectation(proto.Message):
        r"""Evaluates whether each column value lies between a specified
        range.

        Attributes:
            min_value (str):
                Optional. The minimum column value allowed for a row to pass
                this validation. At least one of ``min_value`` and
                ``max_value`` need to be provided.
            max_value (str):
                Optional. The maximum column value allowed for a row to pass
                this validation. At least one of ``min_value`` and
                ``max_value`` need to be provided.
            strict_min_enabled (bool):
                Optional. Whether each value needs to be strictly greater
                than ('>') the minimum, or if equality is allowed.

                Only relevant if a ``min_value`` has been defined. Default =
                false.
            strict_max_enabled (bool):
                Optional. Whether each value needs to be strictly lesser
                than ('<') the maximum, or if equality is allowed.

                Only relevant if a ``max_value`` has been defined. Default =
                false.
        """

        min_value: str = proto.Field(
            proto.STRING,
            number=1,
        )
        max_value: str = proto.Field(
            proto.STRING,
            number=2,
        )
        strict_min_enabled: bool = proto.Field(
            proto.BOOL,
            number=3,
        )
        strict_max_enabled: bool = proto.Field(
            proto.BOOL,
            number=4,
        )

    class NonNullExpectation(proto.Message):
        r"""Evaluates whether each column value is null.
        """

    class SetExpectation(proto.Message):
        r"""Evaluates whether each column value is contained by a
        specified set.

        Attributes:
            values (MutableSequence[str]):
                Expected values for the column value.
        """

        values: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=1,
        )

    class RegexExpectation(proto.Message):
        r"""Evaluates whether each column value matches a specified
        regex.

        Attributes:
            regex (str):
                A regular expression the column value is
                expected to match.
        """

        regex: str = proto.Field(
            proto.STRING,
            number=1,
        )

    class UniquenessExpectation(proto.Message):
        r"""Evaluates whether the column has duplicates.
        """

    class StatisticRangeExpectation(proto.Message):
        r"""Evaluates whether the column aggregate statistic lies between
        a specified range.

        Attributes:
            statistic (google.events.cloud.dataplex_v1.types.DataQualityRule.StatisticRangeExpectation.ColumnStatistic):

            min_value (str):
                The minimum column statistic value allowed for a row to pass
                this validation.

                At least one of ``min_value`` and ``max_value`` need to be
                provided.
            max_value (str):
                The maximum column statistic value allowed for a row to pass
                this validation.

                At least one of ``min_value`` and ``max_value`` need to be
                provided.
            strict_min_enabled (bool):
                Whether column statistic needs to be strictly greater than
                ('>') the minimum, or if equality is allowed.

                Only relevant if a ``min_value`` has been defined. Default =
                false.
            strict_max_enabled (bool):
                Whether column statistic needs to be strictly lesser than
                ('<') the maximum, or if equality is allowed.

                Only relevant if a ``max_value`` has been defined. Default =
                false.
        """
        class ColumnStatistic(proto.Enum):
            r"""

            Values:
                STATISTIC_UNDEFINED (0):
                    Unspecified statistic type
                MEAN (1):
                    Evaluate the column mean
                MIN (2):
                    Evaluate the column min
                MAX (3):
                    Evaluate the column max
            """
            STATISTIC_UNDEFINED = 0
            MEAN = 1
            MIN = 2
            MAX = 3

        statistic: 'DataQualityRule.StatisticRangeExpectation.ColumnStatistic' = proto.Field(
            proto.ENUM,
            number=1,
            enum='DataQualityRule.StatisticRangeExpectation.ColumnStatistic',
        )
        min_value: str = proto.Field(
            proto.STRING,
            number=2,
        )
        max_value: str = proto.Field(
            proto.STRING,
            number=3,
        )
        strict_min_enabled: bool = proto.Field(
            proto.BOOL,
            number=4,
        )
        strict_max_enabled: bool = proto.Field(
            proto.BOOL,
            number=5,
        )

    class RowConditionExpectation(proto.Message):
        r"""Evaluates whether each row passes the specified condition.

        The SQL expression needs to use BigQuery standard SQL syntax and
        should produce a boolean value per row as the result.

        Example: col1 >= 0 AND col2 < 10

        Attributes:
            sql_expression (str):
                The SQL expression.
        """

        sql_expression: str = proto.Field(
            proto.STRING,
            number=1,
        )

    class TableConditionExpectation(proto.Message):
        r"""Evaluates whether the provided expression is true.

        The SQL expression needs to use BigQuery standard SQL syntax and
        should produce a scalar boolean result.

        Example: MIN(col1) >= 0

        Attributes:
            sql_expression (str):
                The SQL expression.
        """

        sql_expression: str = proto.Field(
            proto.STRING,
            number=1,
        )

    range_expectation: RangeExpectation = proto.Field(
        proto.MESSAGE,
        number=1,
        oneof='rule_type',
        message=RangeExpectation,
    )
    non_null_expectation: NonNullExpectation = proto.Field(
        proto.MESSAGE,
        number=2,
        oneof='rule_type',
        message=NonNullExpectation,
    )
    set_expectation: SetExpectation = proto.Field(
        proto.MESSAGE,
        number=3,
        oneof='rule_type',
        message=SetExpectation,
    )
    regex_expectation: RegexExpectation = proto.Field(
        proto.MESSAGE,
        number=4,
        oneof='rule_type',
        message=RegexExpectation,
    )
    uniqueness_expectation: UniquenessExpectation = proto.Field(
        proto.MESSAGE,
        number=100,
        oneof='rule_type',
        message=UniquenessExpectation,
    )
    statistic_range_expectation: StatisticRangeExpectation = proto.Field(
        proto.MESSAGE,
        number=101,
        oneof='rule_type',
        message=StatisticRangeExpectation,
    )
    row_condition_expectation: RowConditionExpectation = proto.Field(
        proto.MESSAGE,
        number=200,
        oneof='rule_type',
        message=RowConditionExpectation,
    )
    table_condition_expectation: TableConditionExpectation = proto.Field(
        proto.MESSAGE,
        number=201,
        oneof='rule_type',
        message=TableConditionExpectation,
    )
    column: str = proto.Field(
        proto.STRING,
        number=500,
    )
    ignore_null: bool = proto.Field(
        proto.BOOL,
        number=501,
    )
    dimension: str = proto.Field(
        proto.STRING,
        number=502,
    )
    threshold: float = proto.Field(
        proto.DOUBLE,
        number=503,
    )


class ResourceAccessSpec(proto.Message):
    r"""ResourceAccessSpec holds the access control configuration to
    be enforced on the resources, for example, Cloud Storage bucket,
    BigQuery dataset, BigQuery table.

    Attributes:
        readers (MutableSequence[str]):
            Optional. The format of strings follows the
            pattern followed by IAM in the bindings.
            user:{email}, serviceAccount:{email}
            group:{email}. The set of principals to be
            granted reader role on the resource.
        writers (MutableSequence[str]):
            Optional. The set of principals to be granted
            writer role on the resource.
        owners (MutableSequence[str]):
            Optional. The set of principals to be granted
            owner role on the resource.
    """

    readers: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=1,
    )
    writers: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=2,
    )
    owners: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=3,
    )


class DataAccessSpec(proto.Message):
    r"""DataAccessSpec holds the access control configuration to be
    enforced on data stored within resources (eg: rows, columns in
    BigQuery Tables). When associated with data, the data is only
    accessible to principals explicitly granted access through the
    DataAccessSpec. Principals with access to the containing
    resource are not implicitly granted access.

    Attributes:
        readers (MutableSequence[str]):
            Optional. The format of strings follows the
            pattern followed by IAM in the bindings.
            user:{email}, serviceAccount:{email}
            group:{email}. The set of principals to be
            granted reader role on data stored within
            resources.
    """

    readers: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=1,
    )


class DataTaxonomy(proto.Message):
    r"""DataTaxonomy represents a set of hierarchical DataAttributes
    resources, grouped with a common theme Eg:
    'SensitiveDataTaxonomy' can have attributes to manage PII data.
    It is defined at project level.

    Attributes:
        name (str):
            Output only. The relative resource name of the DataTaxonomy,
            of the form:
            projects/{project_number}/locations/{location_id}/dataTaxonomies/{data_taxonomy_id}.
        uid (str):
            Output only. System generated globally unique
            ID for the dataTaxonomy. This ID will be
            different if the DataTaxonomy is deleted and
            re-created with the same name.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the DataTaxonomy
            was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the DataTaxonomy
            was last updated.
        description (str):
            Optional. Description of the DataTaxonomy.
        display_name (str):
            Optional. User friendly display name.
        labels (MutableMapping[str, str]):
            Optional. User-defined labels for the
            DataTaxonomy.
        attribute_count (int):
            Output only. The number of attributes in the
            DataTaxonomy.
        etag (str):
            This checksum is computed by the server based
            on the value of other fields, and may be sent on
            update and delete requests to ensure the client
            has an up-to-date value before proceeding.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    uid: str = proto.Field(
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
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=6,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=8,
    )
    attribute_count: int = proto.Field(
        proto.INT32,
        number=9,
    )
    etag: str = proto.Field(
        proto.STRING,
        number=10,
    )


class DataAttribute(proto.Message):
    r"""Denotes one dataAttribute in a dataTaxonomy, for example, PII.
    DataAttribute resources can be defined in a hierarchy. A single
    dataAttribute resource can contain specs of multiple types

    ::

       PII
         - ResourceAccessSpec :
                       - readers :foo@bar.com
         - DataAccessSpec :
                       - readers :bar@foo.com

    Attributes:
        name (str):
            Output only. The relative resource name of the
            dataAttribute, of the form:
            projects/{project_number}/locations/{location_id}/dataTaxonomies/{dataTaxonomy}/attributes/{data_attribute_id}.
        uid (str):
            Output only. System generated globally unique
            ID for the DataAttribute. This ID will be
            different if the DataAttribute is deleted and
            re-created with the same name.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the DataAttribute
            was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the DataAttribute
            was last updated.
        description (str):
            Optional. Description of the DataAttribute.
        display_name (str):
            Optional. User friendly display name.
        labels (MutableMapping[str, str]):
            Optional. User-defined labels for the
            DataAttribute.
        parent_id (str):
            Optional. The ID of the parent DataAttribute resource,
            should belong to the same data taxonomy. Circular dependency
            in parent chain is not valid. Maximum depth of the hierarchy
            allowed is 4. [a -> b -> c -> d -> e, depth = 4]
        attribute_count (int):
            Output only. The number of child attributes
            present for this attribute.
        etag (str):
            This checksum is computed by the server based
            on the value of other fields, and may be sent on
            update and delete requests to ensure the client
            has an up-to-date value before proceeding.
        resource_access_spec (google.events.cloud.dataplex_v1.types.ResourceAccessSpec):
            Optional. Specified when applied to a
            resource (eg: Cloud Storage bucket, BigQuery
            dataset, BigQuery table).
        data_access_spec (google.events.cloud.dataplex_v1.types.DataAccessSpec):
            Optional. Specified when applied to data
            stored on the resource (eg: rows, columns in
            BigQuery Tables).
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    uid: str = proto.Field(
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
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=6,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=7,
    )
    parent_id: str = proto.Field(
        proto.STRING,
        number=8,
    )
    attribute_count: int = proto.Field(
        proto.INT32,
        number=9,
    )
    etag: str = proto.Field(
        proto.STRING,
        number=10,
    )
    resource_access_spec: 'ResourceAccessSpec' = proto.Field(
        proto.MESSAGE,
        number=100,
        message='ResourceAccessSpec',
    )
    data_access_spec: 'DataAccessSpec' = proto.Field(
        proto.MESSAGE,
        number=101,
        message='DataAccessSpec',
    )


class DataAttributeBinding(proto.Message):
    r"""DataAttributeBinding represents binding of attributes to
    resources. Eg: Bind 'CustomerInfo' entity with 'PII' attribute.


    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            Output only. The relative resource name of the Data
            Attribute Binding, of the form:
            projects/{project_number}/locations/{location}/dataAttributeBindings/{data_attribute_binding_id}
        uid (str):
            Output only. System generated globally unique
            ID for the DataAttributeBinding. This ID will be
            different if the DataAttributeBinding is deleted
            and re-created with the same name.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the
            DataAttributeBinding was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the
            DataAttributeBinding was last updated.
        description (str):
            Optional. Description of the
            DataAttributeBinding.
        display_name (str):
            Optional. User friendly display name.
        labels (MutableMapping[str, str]):
            Optional. User-defined labels for the
            DataAttributeBinding.
        etag (str):
            This checksum is computed by the server based
            on the value of other fields, and may be sent on
            update and delete requests to ensure the client
            has an up-to-date value before proceeding. Etags
            must be used when calling the
            DeleteDataAttributeBinding and the
            UpdateDataAttributeBinding method.
        resource (str):
            Optional. Immutable. The resource name of the resource that
            is associated to attributes. Presently, only entity resource
            is supported in the form:
            projects/{project}/locations/{location}/lakes/{lake}/zones/{zone}/entities/{entity_id}
            Must belong in the same project and region as the attribute
            binding, and there can only exist one active binding for a
            resource.

            This field is a member of `oneof`_ ``resource_reference``.
        attributes (MutableSequence[str]):
            Optional. List of attributes to be associated with the
            resource, provided in the form:
            projects/{project}/locations/{location}/dataTaxonomies/{dataTaxonomy}/attributes/{data_attribute_id}
        paths (MutableSequence[google.events.cloud.dataplex_v1.types.DataAttributeBinding.Path]):
            Optional. The list of paths for items within
            the associated resource (eg. columns within a
            table) along with attribute bindings.
    """

    class Path(proto.Message):
        r"""Represents a subresource of a given resource, and associated
        bindings with it.

        Attributes:
            name (str):
                Required. The name identifier of the path.
                Nested columns should be of the form:
                'country.state.city'.
            attributes (MutableSequence[str]):
                Optional. List of attributes to be associated with the path
                of the resource, provided in the form:
                projects/{project}/locations/{location}/dataTaxonomies/{dataTaxonomy}/attributes/{data_attribute_id}
        """

        name: str = proto.Field(
            proto.STRING,
            number=1,
        )
        attributes: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=2,
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    uid: str = proto.Field(
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
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=6,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=7,
    )
    etag: str = proto.Field(
        proto.STRING,
        number=8,
    )
    resource: str = proto.Field(
        proto.STRING,
        number=100,
        oneof='resource_reference',
    )
    attributes: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=110,
    )
    paths: MutableSequence[Path] = proto.RepeatedField(
        proto.MESSAGE,
        number=120,
        message=Path,
    )


class DataScan(proto.Message):
    r"""Represents a user-visible job which provides the insights for the
    related data source.

    For example:

    -  Data Quality: generates queries based on the rules and runs
       against the data to get data quality check results.
    -  Data Profile: analyzes the data in table(s) and generates
       insights about the structure, content and relationships (such as
       null percent, cardinality, min/max/mean, etc).

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            Output only. The relative resource name of the scan, of the
            form:
            ``projects/{project}/locations/{location_id}/dataScans/{datascan_id}``,
            where ``project`` refers to a *project_id* or
            *project_number* and ``location_id`` refers to a GCP region.
        uid (str):
            Output only. System generated globally unique
            ID for the scan. This ID will be different if
            the scan is deleted and re-created with the same
            name.
        description (str):
            Optional. Description of the scan.

            -  Must be between 1-1024 characters.
        display_name (str):
            Optional. User friendly display name.

            -  Must be between 1-256 characters.
        labels (MutableMapping[str, str]):
            Optional. User-defined labels for the scan.
        state (google.events.cloud.dataplex_v1.types.State):
            Output only. Current state of the DataScan.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the scan was
            created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the scan was last
            updated.
        data (google.events.cloud.dataplex_v1.types.DataSource):
            Required. The data source for DataScan.
        execution_spec (google.events.cloud.dataplex_v1.types.DataScan.ExecutionSpec):
            Optional. DataScan execution settings.

            If not specified, the fields in it will use
            their default values.
        execution_status (google.events.cloud.dataplex_v1.types.DataScan.ExecutionStatus):
            Output only. Status of the data scan
            execution.
        type_ (google.events.cloud.dataplex_v1.types.DataScanType):
            Output only. The type of DataScan.
        data_quality_spec (google.events.cloud.dataplex_v1.types.DataQualitySpec):
            DataQualityScan related setting.

            This field is a member of `oneof`_ ``spec``.
        data_profile_spec (google.events.cloud.dataplex_v1.types.DataProfileSpec):
            DataProfileScan related setting.

            This field is a member of `oneof`_ ``spec``.
        data_quality_result (google.events.cloud.dataplex_v1.types.DataQualityResult):
            Output only. The result of the data quality
            scan.

            This field is a member of `oneof`_ ``result``.
        data_profile_result (google.events.cloud.dataplex_v1.types.DataProfileResult):
            Output only. The result of the data profile
            scan.

            This field is a member of `oneof`_ ``result``.
    """

    class ExecutionSpec(proto.Message):
        r"""DataScan execution settings.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            trigger (google.events.cloud.dataplex_v1.types.Trigger):
                Optional. Spec related to how often and when a scan should
                be triggered.

                If not specified, the default is ``OnDemand``, which means
                the scan will not run until the user calls ``RunDataScan``
                API.
            field (str):
                Immutable. The unnested field (of type *Date* or
                *Timestamp*) that contains values which monotonically
                increase over time.

                If not specified, a data scan will run for all data in the
                table.

                This field is a member of `oneof`_ ``incremental``.
        """

        trigger: 'Trigger' = proto.Field(
            proto.MESSAGE,
            number=1,
            message='Trigger',
        )
        field: str = proto.Field(
            proto.STRING,
            number=100,
            oneof='incremental',
        )

    class ExecutionStatus(proto.Message):
        r"""Status of the data scan execution.

        Attributes:
            latest_job_start_time (google.protobuf.timestamp_pb2.Timestamp):
                The time when the latest DataScanJob started.
            latest_job_end_time (google.protobuf.timestamp_pb2.Timestamp):
                The time when the latest DataScanJob ended.
        """

        latest_job_start_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=4,
            message=timestamp_pb2.Timestamp,
        )
        latest_job_end_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=5,
            message=timestamp_pb2.Timestamp,
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    uid: str = proto.Field(
        proto.STRING,
        number=2,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=4,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=5,
    )
    state: 'State' = proto.Field(
        proto.ENUM,
        number=6,
        enum='State',
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=8,
        message=timestamp_pb2.Timestamp,
    )
    data: 'DataSource' = proto.Field(
        proto.MESSAGE,
        number=9,
        message='DataSource',
    )
    execution_spec: ExecutionSpec = proto.Field(
        proto.MESSAGE,
        number=10,
        message=ExecutionSpec,
    )
    execution_status: ExecutionStatus = proto.Field(
        proto.MESSAGE,
        number=11,
        message=ExecutionStatus,
    )
    type_: 'DataScanType' = proto.Field(
        proto.ENUM,
        number=12,
        enum='DataScanType',
    )
    data_quality_spec: 'DataQualitySpec' = proto.Field(
        proto.MESSAGE,
        number=100,
        oneof='spec',
        message='DataQualitySpec',
    )
    data_profile_spec: 'DataProfileSpec' = proto.Field(
        proto.MESSAGE,
        number=101,
        oneof='spec',
        message='DataProfileSpec',
    )
    data_quality_result: 'DataQualityResult' = proto.Field(
        proto.MESSAGE,
        number=200,
        oneof='result',
        message='DataQualityResult',
    )
    data_profile_result: 'DataProfileResult' = proto.Field(
        proto.MESSAGE,
        number=201,
        oneof='result',
        message='DataProfileResult',
    )


class Task(proto.Message):
    r"""A task represents a user-visible job.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            Output only. The relative resource name of the task, of the
            form:
            projects/{project_number}/locations/{location_id}/lakes/{lake_id}/
            tasks/{task_id}.
        uid (str):
            Output only. System generated globally unique
            ID for the task. This ID will be different if
            the task is deleted and re-created with the same
            name.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the task was
            created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the task was last
            updated.
        description (str):
            Optional. Description of the task.
        display_name (str):
            Optional. User friendly display name.
        state (google.events.cloud.dataplex_v1.types.State):
            Output only. Current state of the task.
        labels (MutableMapping[str, str]):
            Optional. User-defined labels for the task.
        trigger_spec (google.events.cloud.dataplex_v1.types.Task.TriggerSpec):
            Required. Spec related to how often and when
            a task should be triggered.
        execution_spec (google.events.cloud.dataplex_v1.types.Task.ExecutionSpec):
            Required. Spec related to how a task is
            executed.
        execution_status (google.events.cloud.dataplex_v1.types.Task.ExecutionStatus):
            Output only. Status of the latest task
            executions.
        spark (google.events.cloud.dataplex_v1.types.Task.SparkTaskConfig):
            Config related to running custom Spark tasks.

            This field is a member of `oneof`_ ``config``.
        notebook (google.events.cloud.dataplex_v1.types.Task.NotebookTaskConfig):
            Config related to running scheduled
            Notebooks.

            This field is a member of `oneof`_ ``config``.
    """

    class InfrastructureSpec(proto.Message):
        r"""Configuration for the underlying infrastructure used to run
        workloads.


        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            batch (google.events.cloud.dataplex_v1.types.Task.InfrastructureSpec.BatchComputeResources):
                Compute resources needed for a Task when
                using Dataproc Serverless.

                This field is a member of `oneof`_ ``resources``.
            container_image (google.events.cloud.dataplex_v1.types.Task.InfrastructureSpec.ContainerImageRuntime):
                Container Image Runtime Configuration.

                This field is a member of `oneof`_ ``runtime``.
            vpc_network (google.events.cloud.dataplex_v1.types.Task.InfrastructureSpec.VpcNetwork):
                Vpc network.

                This field is a member of `oneof`_ ``network``.
        """

        class BatchComputeResources(proto.Message):
            r"""Batch compute resources associated with the task.

            Attributes:
                executors_count (int):
                    Optional. Total number of job executors. Executor Count
                    should be between 2 and 100. [Default=2]
                max_executors_count (int):
                    Optional. Max configurable executors. If max_executors_count
                    > executors_count, then auto-scaling is enabled. Max
                    Executor Count should be between 2 and 1000. [Default=1000]
            """

            executors_count: int = proto.Field(
                proto.INT32,
                number=1,
            )
            max_executors_count: int = proto.Field(
                proto.INT32,
                number=2,
            )

        class ContainerImageRuntime(proto.Message):
            r"""Container Image Runtime Configuration used with Batch
            execution.

            Attributes:
                image (str):
                    Optional. Container image to use.
                java_jars (MutableSequence[str]):
                    Optional. A list of Java JARS to add to the
                    classpath. Valid input includes Cloud Storage
                    URIs to Jar binaries. For example,
                    gs://bucket-name/my/path/to/file.jar
                python_packages (MutableSequence[str]):
                    Optional. A list of python packages to be
                    installed. Valid formats include Cloud Storage
                    URI to a PIP installable library. For example,
                    gs://bucket-name/my/path/to/lib.tar.gz
                properties (MutableMapping[str, str]):
                    Optional. Override to common configuration of open source
                    components installed on the Dataproc cluster. The properties
                    to set on daemon config files. Property keys are specified
                    in ``prefix:property`` format, for example
                    ``core:hadoop.tmp.dir``. For more information, see `Cluster
                    properties <https://cloud.google.com/dataproc/docs/concepts/cluster-properties>`__.
            """

            image: str = proto.Field(
                proto.STRING,
                number=1,
            )
            java_jars: MutableSequence[str] = proto.RepeatedField(
                proto.STRING,
                number=2,
            )
            python_packages: MutableSequence[str] = proto.RepeatedField(
                proto.STRING,
                number=3,
            )
            properties: MutableMapping[str, str] = proto.MapField(
                proto.STRING,
                proto.STRING,
                number=4,
            )

        class VpcNetwork(proto.Message):
            r"""Cloud VPC Network used to run the infrastructure.

            This message has `oneof`_ fields (mutually exclusive fields).
            For each oneof, at most one member field can be set at the same time.
            Setting any member of the oneof automatically clears all other
            members.

            .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

            Attributes:
                network (str):
                    Optional. The Cloud VPC network in which the
                    job is run. By default, the Cloud VPC network
                    named Default within the project is used.

                    This field is a member of `oneof`_ ``network_name``.
                sub_network (str):
                    Optional. The Cloud VPC sub-network in which
                    the job is run.

                    This field is a member of `oneof`_ ``network_name``.
                network_tags (MutableSequence[str]):
                    Optional. List of network tags to apply to
                    the job.
            """

            network: str = proto.Field(
                proto.STRING,
                number=1,
                oneof='network_name',
            )
            sub_network: str = proto.Field(
                proto.STRING,
                number=2,
                oneof='network_name',
            )
            network_tags: MutableSequence[str] = proto.RepeatedField(
                proto.STRING,
                number=3,
            )

        batch: 'Task.InfrastructureSpec.BatchComputeResources' = proto.Field(
            proto.MESSAGE,
            number=52,
            oneof='resources',
            message='Task.InfrastructureSpec.BatchComputeResources',
        )
        container_image: 'Task.InfrastructureSpec.ContainerImageRuntime' = proto.Field(
            proto.MESSAGE,
            number=101,
            oneof='runtime',
            message='Task.InfrastructureSpec.ContainerImageRuntime',
        )
        vpc_network: 'Task.InfrastructureSpec.VpcNetwork' = proto.Field(
            proto.MESSAGE,
            number=150,
            oneof='network',
            message='Task.InfrastructureSpec.VpcNetwork',
        )

    class TriggerSpec(proto.Message):
        r"""Task scheduling and trigger settings.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            type_ (google.events.cloud.dataplex_v1.types.Task.TriggerSpec.Type):
                Required. Immutable. Trigger type of the
                user-specified Task.
            start_time (google.protobuf.timestamp_pb2.Timestamp):
                Optional. The first run of the task will be after this time.
                If not specified, the task will run shortly after being
                submitted if ON_DEMAND and based on the schedule if
                RECURRING.
            disabled (bool):
                Optional. Prevent the task from executing.
                This does not cancel already running tasks. It
                is intended to temporarily disable RECURRING
                tasks.
            max_retries (int):
                Optional. Number of retry attempts before
                aborting. Set to zero to never attempt to retry
                a failed task.
            schedule (str):
                Optional. Cron schedule (https://en.wikipedia.org/wiki/Cron)
                for running tasks periodically. To explicitly set a timezone
                to the cron tab, apply a prefix in the cron tab:
                "CRON_TZ=${IANA_TIME_ZONE}" or "TZ=${IANA_TIME_ZONE}". The
                ${IANA_TIME_ZONE} may only be a valid string from IANA time
                zone database. For example,
                ``CRON_TZ=America/New_York 1 * * * *``, or
                ``TZ=America/New_York 1 * * * *``. This field is required
                for RECURRING tasks.

                This field is a member of `oneof`_ ``trigger``.
        """
        class Type(proto.Enum):
            r"""Determines how often and when the job will run.

            Values:
                TYPE_UNSPECIFIED (0):
                    Unspecified trigger type.
                ON_DEMAND (1):
                    The task runs one-time shortly after Task
                    Creation.
                RECURRING (2):
                    The task is scheduled to run periodically.
            """
            TYPE_UNSPECIFIED = 0
            ON_DEMAND = 1
            RECURRING = 2

        type_: 'Task.TriggerSpec.Type' = proto.Field(
            proto.ENUM,
            number=5,
            enum='Task.TriggerSpec.Type',
        )
        start_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=6,
            message=timestamp_pb2.Timestamp,
        )
        disabled: bool = proto.Field(
            proto.BOOL,
            number=4,
        )
        max_retries: int = proto.Field(
            proto.INT32,
            number=7,
        )
        schedule: str = proto.Field(
            proto.STRING,
            number=100,
            oneof='trigger',
        )

    class ExecutionSpec(proto.Message):
        r"""Execution related settings, like retry and service_account.

        Attributes:
            args (MutableMapping[str, str]):
                Optional. The arguments to pass to the task. The args can
                use placeholders of the format ${placeholder} as part of
                key/value string. These will be interpolated before passing
                the args to the driver. Currently supported placeholders:

                -  ${task_id}
                -  ${job_time} To pass positional args, set the key as
                   TASK_ARGS. The value should be a comma-separated string
                   of all the positional arguments. To use a delimiter other
                   than comma, refer to
                   https://cloud.google.com/sdk/gcloud/reference/topic/escaping.
                   In case of other keys being present in the args, then
                   TASK_ARGS will be passed as the last argument.
            service_account (str):
                Required. Service account to use to execute a
                task. If not provided, the default Compute
                service account for the project is used.
            project (str):
                Optional. The project in which jobs are run. By default, the
                project containing the Lake is used. If a project is
                provided, the
                [ExecutionSpec.service_account][google.cloud.dataplex.v1.Task.ExecutionSpec.service_account]
                must belong to this project.
            max_job_execution_lifetime (google.protobuf.duration_pb2.Duration):
                Optional. The maximum duration after which
                the job execution is expired.
            kms_key (str):
                Optional. The Cloud KMS key to use for encryption, of the
                form:
                ``projects/{project_number}/locations/{location_id}/keyRings/{key-ring-name}/cryptoKeys/{key-name}``.
        """

        args: MutableMapping[str, str] = proto.MapField(
            proto.STRING,
            proto.STRING,
            number=4,
        )
        service_account: str = proto.Field(
            proto.STRING,
            number=5,
        )
        project: str = proto.Field(
            proto.STRING,
            number=7,
        )
        max_job_execution_lifetime: duration_pb2.Duration = proto.Field(
            proto.MESSAGE,
            number=8,
            message=duration_pb2.Duration,
        )
        kms_key: str = proto.Field(
            proto.STRING,
            number=9,
        )

    class SparkTaskConfig(proto.Message):
        r"""User-specified config for running a Spark task.

        This message has `oneof`_ fields (mutually exclusive fields).
        For each oneof, at most one member field can be set at the same time.
        Setting any member of the oneof automatically clears all other
        members.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            main_jar_file_uri (str):
                The Cloud Storage URI of the jar file that contains the main
                class. The execution args are passed in as a sequence of
                named process arguments (``--key=value``).

                This field is a member of `oneof`_ ``driver``.
            main_class (str):
                The name of the driver's main class. The jar file that
                contains the class must be in the default CLASSPATH or
                specified in ``jar_file_uris``. The execution args are
                passed in as a sequence of named process arguments
                (``--key=value``).

                This field is a member of `oneof`_ ``driver``.
            python_script_file (str):
                The Gcloud Storage URI of the main Python file to use as the
                driver. Must be a .py file. The execution args are passed in
                as a sequence of named process arguments (``--key=value``).

                This field is a member of `oneof`_ ``driver``.
            sql_script_file (str):
                A reference to a query file. This can be the Cloud Storage
                URI of the query file or it can the path to a SqlScript
                Content. The execution args are used to declare a set of
                script variables (``set key="value";``).

                This field is a member of `oneof`_ ``driver``.
            sql_script (str):
                The query text. The execution args are used to declare a set
                of script variables (``set key="value";``).

                This field is a member of `oneof`_ ``driver``.
            file_uris (MutableSequence[str]):
                Optional. Cloud Storage URIs of files to be
                placed in the working directory of each
                executor.
            archive_uris (MutableSequence[str]):
                Optional. Cloud Storage URIs of archives to
                be extracted into the working directory of each
                executor. Supported file types: .jar, .tar,
                .tar.gz, .tgz, and .zip.
            infrastructure_spec (google.events.cloud.dataplex_v1.types.Task.InfrastructureSpec):
                Optional. Infrastructure specification for
                the execution.
        """

        main_jar_file_uri: str = proto.Field(
            proto.STRING,
            number=100,
            oneof='driver',
        )
        main_class: str = proto.Field(
            proto.STRING,
            number=101,
            oneof='driver',
        )
        python_script_file: str = proto.Field(
            proto.STRING,
            number=102,
            oneof='driver',
        )
        sql_script_file: str = proto.Field(
            proto.STRING,
            number=104,
            oneof='driver',
        )
        sql_script: str = proto.Field(
            proto.STRING,
            number=105,
            oneof='driver',
        )
        file_uris: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=3,
        )
        archive_uris: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=4,
        )
        infrastructure_spec: 'Task.InfrastructureSpec' = proto.Field(
            proto.MESSAGE,
            number=6,
            message='Task.InfrastructureSpec',
        )

    class NotebookTaskConfig(proto.Message):
        r"""Config for running scheduled notebooks.

        Attributes:
            notebook (str):
                Required. Path to input notebook. This can be the Cloud
                Storage URI of the notebook file or the path to a Notebook
                Content. The execution args are accessible as environment
                variables (``TASK_key=value``).
            infrastructure_spec (google.events.cloud.dataplex_v1.types.Task.InfrastructureSpec):
                Optional. Infrastructure specification for
                the execution.
            file_uris (MutableSequence[str]):
                Optional. Cloud Storage URIs of files to be
                placed in the working directory of each
                executor.
            archive_uris (MutableSequence[str]):
                Optional. Cloud Storage URIs of archives to
                be extracted into the working directory of each
                executor. Supported file types: .jar, .tar,
                .tar.gz, .tgz, and .zip.
        """

        notebook: str = proto.Field(
            proto.STRING,
            number=4,
        )
        infrastructure_spec: 'Task.InfrastructureSpec' = proto.Field(
            proto.MESSAGE,
            number=3,
            message='Task.InfrastructureSpec',
        )
        file_uris: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=5,
        )
        archive_uris: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=6,
        )

    class ExecutionStatus(proto.Message):
        r"""Status of the task execution (e.g. Jobs).

        Attributes:
            update_time (google.protobuf.timestamp_pb2.Timestamp):
                Output only. Last update time of the status.
            latest_job (google.events.cloud.dataplex_v1.types.Job):
                Output only. latest job execution
        """

        update_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=3,
            message=timestamp_pb2.Timestamp,
        )
        latest_job: 'Job' = proto.Field(
            proto.MESSAGE,
            number=9,
            message='Job',
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    uid: str = proto.Field(
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
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=6,
    )
    state: 'State' = proto.Field(
        proto.ENUM,
        number=7,
        enum='State',
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=8,
    )
    trigger_spec: TriggerSpec = proto.Field(
        proto.MESSAGE,
        number=100,
        message=TriggerSpec,
    )
    execution_spec: ExecutionSpec = proto.Field(
        proto.MESSAGE,
        number=101,
        message=ExecutionSpec,
    )
    execution_status: ExecutionStatus = proto.Field(
        proto.MESSAGE,
        number=201,
        message=ExecutionStatus,
    )
    spark: SparkTaskConfig = proto.Field(
        proto.MESSAGE,
        number=300,
        oneof='config',
        message=SparkTaskConfig,
    )
    notebook: NotebookTaskConfig = proto.Field(
        proto.MESSAGE,
        number=302,
        oneof='config',
        message=NotebookTaskConfig,
    )


class Job(proto.Message):
    r"""A job represents an instance of a task.

    Attributes:
        name (str):
            Output only. The relative resource name of the job, of the
            form:
            ``projects/{project_number}/locations/{location_id}/lakes/{lake_id}/tasks/{task_id}/jobs/{job_id}``.
        uid (str):
            Output only. System generated globally unique
            ID for the job.
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the job was
            started.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the job ended.
        state (google.events.cloud.dataplex_v1.types.Job.State):
            Output only. Execution state for the job.
        retry_count (int):
            Output only. The number of times the job has
            been retried (excluding the initial attempt).
        service (google.events.cloud.dataplex_v1.types.Job.Service):
            Output only. The underlying service running a
            job.
        service_job (str):
            Output only. The full resource name for the
            job run under a particular service.
        message (str):
            Output only. Additional information about the
            current state.
    """
    class Service(proto.Enum):
        r"""

        Values:
            SERVICE_UNSPECIFIED (0):
                Service used to run the job is unspecified.
            DATAPROC (1):
                Dataproc service is used to run this job.
        """
        SERVICE_UNSPECIFIED = 0
        DATAPROC = 1

    class State(proto.Enum):
        r"""

        Values:
            STATE_UNSPECIFIED (0):
                The job state is unknown.
            RUNNING (1):
                The job is running.
            CANCELLING (2):
                The job is cancelling.
            CANCELLED (3):
                The job cancellation was successful.
            SUCCEEDED (4):
                The job completed successfully.
            FAILED (5):
                The job is no longer running due to an error.
            ABORTED (6):
                The job was cancelled outside of Dataplex.
        """
        STATE_UNSPECIFIED = 0
        RUNNING = 1
        CANCELLING = 2
        CANCELLED = 3
        SUCCEEDED = 4
        FAILED = 5
        ABORTED = 6

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    uid: str = proto.Field(
        proto.STRING,
        number=2,
    )
    start_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=5,
        enum=State,
    )
    retry_count: int = proto.Field(
        proto.UINT32,
        number=6,
    )
    service: Service = proto.Field(
        proto.ENUM,
        number=7,
        enum=Service,
    )
    service_job: str = proto.Field(
        proto.STRING,
        number=8,
    )
    message: str = proto.Field(
        proto.STRING,
        number=9,
    )


class TaskEventData(proto.Message):
    r"""The data within all Task events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.dataplex_v1.types.Task):
            Optional. The Task event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Task' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Task',
    )


class ZoneEventData(proto.Message):
    r"""The data within all Zone events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.dataplex_v1.types.Zone):
            Optional. The Zone event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Zone' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Zone',
    )


class AssetEventData(proto.Message):
    r"""The data within all Asset events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.dataplex_v1.types.Asset):
            Optional. The Asset event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Asset' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Asset',
    )


class EnvironmentEventData(proto.Message):
    r"""The data within all Environment events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.dataplex_v1.types.Environment):
            Optional. The Environment event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Environment' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Environment',
    )


class DataTaxonomyEventData(proto.Message):
    r"""The data within all DataTaxonomy events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.dataplex_v1.types.DataTaxonomy):
            Optional. The DataTaxonomy event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'DataTaxonomy' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='DataTaxonomy',
    )


class DataAttributeBindingEventData(proto.Message):
    r"""The data within all DataAttributeBinding events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.dataplex_v1.types.DataAttributeBinding):
            Optional. The DataAttributeBinding event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'DataAttributeBinding' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='DataAttributeBinding',
    )


class DataScanEventData(proto.Message):
    r"""The data within all DataScan events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.dataplex_v1.types.DataScan):
            Optional. The DataScan event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'DataScan' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='DataScan',
    )


class LakeEventData(proto.Message):
    r"""The data within all Lake events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.dataplex_v1.types.Lake):
            Optional. The Lake event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Lake' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Lake',
    )


class DataAttributeEventData(proto.Message):
    r"""The data within all DataAttribute events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.dataplex_v1.types.DataAttribute):
            Optional. The DataAttribute event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'DataAttribute' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='DataAttribute',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
