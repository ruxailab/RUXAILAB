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
from google.protobuf import wrappers_pb2  # type: ignore
from google.rpc import status_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.clouddms.v1',
    manifest={
        'NetworkArchitecture',
        'DatabaseEngine',
        'DatabaseProvider',
        'SslConfig',
        'MySqlConnectionProfile',
        'PostgreSqlConnectionProfile',
        'CloudSqlConnectionProfile',
        'AlloyDbConnectionProfile',
        'SqlAclEntry',
        'SqlIpConfig',
        'CloudSqlSettings',
        'AlloyDbSettings',
        'StaticIpConnectivity',
        'ReverseSshConnectivity',
        'VpcPeeringConnectivity',
        'DatabaseType',
        'MigrationJob',
        'ConnectionProfile',
        'ConnectionProfileEventData',
        'MigrationJobEventData',
    },
)


class NetworkArchitecture(proto.Enum):
    r"""

    Values:
        NETWORK_ARCHITECTURE_UNSPECIFIED (0):
            No description available.
        NETWORK_ARCHITECTURE_OLD_CSQL_PRODUCER (1):
            Instance is in Cloud SQL's old producer
            network architecture.
        NETWORK_ARCHITECTURE_NEW_CSQL_PRODUCER (2):
            Instance is in Cloud SQL's new producer
            network architecture.
    """
    NETWORK_ARCHITECTURE_UNSPECIFIED = 0
    NETWORK_ARCHITECTURE_OLD_CSQL_PRODUCER = 1
    NETWORK_ARCHITECTURE_NEW_CSQL_PRODUCER = 2


class DatabaseEngine(proto.Enum):
    r"""The database engine types.

    Values:
        DATABASE_ENGINE_UNSPECIFIED (0):
            The source database engine of the migration
            job is unknown.
        MYSQL (1):
            The source engine is MySQL.
        POSTGRESQL (2):
            The source engine is PostgreSQL.
    """
    DATABASE_ENGINE_UNSPECIFIED = 0
    MYSQL = 1
    POSTGRESQL = 2


class DatabaseProvider(proto.Enum):
    r"""The database providers.

    Values:
        DATABASE_PROVIDER_UNSPECIFIED (0):
            The database provider is unknown.
        CLOUDSQL (1):
            CloudSQL runs the database.
        RDS (2):
            RDS runs the database.
        AURORA (3):
            Amazon Aurora.
        ALLOYDB (4):
            AlloyDB.
    """
    DATABASE_PROVIDER_UNSPECIFIED = 0
    CLOUDSQL = 1
    RDS = 2
    AURORA = 3
    ALLOYDB = 4


class SslConfig(proto.Message):
    r"""SSL configuration information.

    Attributes:
        type_ (google.events.cloud.clouddms_v1.types.SslConfig.SslType):
            Output only. The ssl config type according to 'client_key',
            'client_certificate' and 'ca_certificate'.
    """
    class SslType(proto.Enum):
        r"""Specifies The kind of ssl configuration used.

        Values:
            SSL_TYPE_UNSPECIFIED (0):
                Unspecified.
            SERVER_ONLY (1):
                Only 'ca_certificate' specified.
            SERVER_CLIENT (2):
                Both server ('ca_certificate'), and client ('client_key',
                'client_certificate') specified.
        """
        SSL_TYPE_UNSPECIFIED = 0
        SERVER_ONLY = 1
        SERVER_CLIENT = 2

    type_: SslType = proto.Field(
        proto.ENUM,
        number=1,
        enum=SslType,
    )


class MySqlConnectionProfile(proto.Message):
    r"""Specifies connection parameters required specifically for
    MySQL databases.

    Attributes:
        host (str):
            Required. The IP or hostname of the source
            MySQL database.
        port (int):
            Required. The network port of the source
            MySQL database.
        username (str):
            Required. The username that Database
            Migration Service will use to connect to the
            database. The value is encrypted when stored in
            Database Migration Service.
        password_set (bool):
            Output only. Indicates If this connection
            profile password is stored.
        ssl (google.events.cloud.clouddms_v1.types.SslConfig):
            SSL configuration for the destination to
            connect to the source database.
        cloud_sql_id (str):
            If the source is a Cloud SQL database, use
            this field to provide the Cloud SQL instance ID
            of the source.
    """

    host: str = proto.Field(
        proto.STRING,
        number=1,
    )
    port: int = proto.Field(
        proto.INT32,
        number=2,
    )
    username: str = proto.Field(
        proto.STRING,
        number=3,
    )
    password_set: bool = proto.Field(
        proto.BOOL,
        number=5,
    )
    ssl: 'SslConfig' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='SslConfig',
    )
    cloud_sql_id: str = proto.Field(
        proto.STRING,
        number=7,
    )


class PostgreSqlConnectionProfile(proto.Message):
    r"""Specifies connection parameters required specifically for
    PostgreSQL databases.

    Attributes:
        host (str):
            Required. The IP or hostname of the source
            PostgreSQL database.
        port (int):
            Required. The network port of the source
            PostgreSQL database.
        username (str):
            Required. The username that Database
            Migration Service will use to connect to the
            database. The value is encrypted when stored in
            Database Migration Service.
        password_set (bool):
            Output only. Indicates If this connection
            profile password is stored.
        ssl (google.events.cloud.clouddms_v1.types.SslConfig):
            SSL configuration for the destination to
            connect to the source database.
        cloud_sql_id (str):
            If the source is a Cloud SQL database, use
            this field to provide the Cloud SQL instance ID
            of the source.
        network_architecture (google.events.cloud.clouddms_v1.types.NetworkArchitecture):
            Output only. If the source is a Cloud SQL
            database, this field indicates the network
            architecture it's associated with.
    """

    host: str = proto.Field(
        proto.STRING,
        number=1,
    )
    port: int = proto.Field(
        proto.INT32,
        number=2,
    )
    username: str = proto.Field(
        proto.STRING,
        number=3,
    )
    password_set: bool = proto.Field(
        proto.BOOL,
        number=5,
    )
    ssl: 'SslConfig' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='SslConfig',
    )
    cloud_sql_id: str = proto.Field(
        proto.STRING,
        number=7,
    )
    network_architecture: 'NetworkArchitecture' = proto.Field(
        proto.ENUM,
        number=8,
        enum='NetworkArchitecture',
    )


class CloudSqlConnectionProfile(proto.Message):
    r"""Specifies required connection parameters, and, optionally,
    the parameters required to create a Cloud SQL destination
    database instance.

    Attributes:
        cloud_sql_id (str):
            Output only. The Cloud SQL instance ID that
            this connection profile is associated with.
        settings (google.events.cloud.clouddms_v1.types.CloudSqlSettings):
            Immutable. Metadata used to create the
            destination Cloud SQL database.
        private_ip (str):
            Output only. The Cloud SQL database
            instance's private IP.
        public_ip (str):
            Output only. The Cloud SQL database
            instance's public IP.
        additional_public_ip (str):
            Output only. The Cloud SQL database
            instance's additional (outgoing) public IP. Used
            when the Cloud SQL database availability type is
            REGIONAL (i.e. multiple zones / highly
            available).
    """

    cloud_sql_id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    settings: 'CloudSqlSettings' = proto.Field(
        proto.MESSAGE,
        number=2,
        message='CloudSqlSettings',
    )
    private_ip: str = proto.Field(
        proto.STRING,
        number=3,
    )
    public_ip: str = proto.Field(
        proto.STRING,
        number=4,
    )
    additional_public_ip: str = proto.Field(
        proto.STRING,
        number=5,
    )


class AlloyDbConnectionProfile(proto.Message):
    r"""Specifies required connection parameters, and the parameters
    required to create an AlloyDB destination cluster.

    Attributes:
        cluster_id (str):
            Required. The AlloyDB cluster ID that this
            connection profile is associated with.
        settings (google.events.cloud.clouddms_v1.types.AlloyDbSettings):
            Immutable. Metadata used to create the
            destination AlloyDB cluster.
    """

    cluster_id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    settings: 'AlloyDbSettings' = proto.Field(
        proto.MESSAGE,
        number=2,
        message='AlloyDbSettings',
    )


class SqlAclEntry(proto.Message):
    r"""An entry for an Access Control list.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        value (str):
            The allowlisted value for the access control
            list.
        expire_time (google.protobuf.timestamp_pb2.Timestamp):
            The time when this access control entry expires in `RFC
            3339 <https://tools.ietf.org/html/rfc3339>`__ format, for
            example: ``2012-11-15T16:19:00.094Z``.

            This field is a member of `oneof`_ ``expiration``.
        label (str):
            A label to identify this entry.
    """

    value: str = proto.Field(
        proto.STRING,
        number=1,
    )
    expire_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=10,
        oneof='expiration',
        message=timestamp_pb2.Timestamp,
    )
    label: str = proto.Field(
        proto.STRING,
        number=3,
    )


class SqlIpConfig(proto.Message):
    r"""IP Management configuration.

    Attributes:
        enable_ipv4 (google.protobuf.wrappers_pb2.BoolValue):
            Whether the instance should be assigned an
            IPv4 address or not.
        private_network (str):
            The resource link for the VPC network from which the Cloud
            SQL instance is accessible for private IP. For example,
            ``projects/myProject/global/networks/default``. This setting
            can be updated, but it cannot be removed after it is set.
        require_ssl (google.protobuf.wrappers_pb2.BoolValue):
            Whether SSL connections over IP should be
            enforced or not.
        authorized_networks (MutableSequence[google.events.cloud.clouddms_v1.types.SqlAclEntry]):
            The list of external networks that are allowed to connect to
            the instance using the IP. See
            https://en.wikipedia.org/wiki/CIDR_notation#CIDR_notation,
            also known as 'slash' notation (e.g. ``192.168.100.0/24``).
    """

    enable_ipv4: wrappers_pb2.BoolValue = proto.Field(
        proto.MESSAGE,
        number=1,
        message=wrappers_pb2.BoolValue,
    )
    private_network: str = proto.Field(
        proto.STRING,
        number=2,
    )
    require_ssl: wrappers_pb2.BoolValue = proto.Field(
        proto.MESSAGE,
        number=3,
        message=wrappers_pb2.BoolValue,
    )
    authorized_networks: MutableSequence['SqlAclEntry'] = proto.RepeatedField(
        proto.MESSAGE,
        number=4,
        message='SqlAclEntry',
    )


class CloudSqlSettings(proto.Message):
    r"""Settings for creating a Cloud SQL database instance.

    Attributes:
        database_version (google.events.cloud.clouddms_v1.types.CloudSqlSettings.SqlDatabaseVersion):
            The database engine type and version.
        user_labels (MutableMapping[str, str]):
            The resource labels for a Cloud SQL instance to use to
            annotate any related underlying resources such as Compute
            Engine VMs. An object containing a list of "key": "value"
            pairs.

            Example:
            ``{ "name": "wrench", "mass": "18kg", "count": "3" }``.
        tier (str):
            The tier (or machine type) for this instance, for example:
            ``db-n1-standard-1`` (MySQL instances) or
            ``db-custom-1-3840`` (PostgreSQL instances). For more
            information, see `Cloud SQL Instance
            Settings <https://cloud.google.com/sql/docs/mysql/instance-settings>`__.
        storage_auto_resize_limit (google.protobuf.wrappers_pb2.Int64Value):
            The maximum size to which storage capacity
            can be automatically increased. The default
            value is 0, which specifies that there is no
            limit.
        activation_policy (google.events.cloud.clouddms_v1.types.CloudSqlSettings.SqlActivationPolicy):
            The activation policy specifies when the instance is
            activated; it is applicable only when the instance state is
            'RUNNABLE'. Valid values:

            'ALWAYS': The instance is on, and remains so even in the
            absence of connection requests.

            ``NEVER``: The instance is off; it is not activated, even if
            a connection request arrives.
        ip_config (google.events.cloud.clouddms_v1.types.SqlIpConfig):
            The settings for IP Management. This allows
            to enable or disable the instance IP and manage
            which external networks can connect to the
            instance. The IPv4 address cannot be disabled.
        auto_storage_increase (google.protobuf.wrappers_pb2.BoolValue):
            [default: ON] If you enable this setting, Cloud SQL checks
            your available storage every 30 seconds. If the available
            storage falls below a threshold size, Cloud SQL
            automatically adds additional storage capacity. If the
            available storage repeatedly falls below the threshold size,
            Cloud SQL continues to add storage until it reaches the
            maximum of 30 TB.
        database_flags (MutableMapping[str, str]):
            The database flags passed to the Cloud SQL
            instance at startup. An object containing a list
            of "key": value pairs. Example: { "name":
            "wrench", "mass": "1.3kg", "count": "3" }.
        data_disk_type (google.events.cloud.clouddms_v1.types.CloudSqlSettings.SqlDataDiskType):
            The type of storage: ``PD_SSD`` (default) or ``PD_HDD``.
        data_disk_size_gb (google.protobuf.wrappers_pb2.Int64Value):
            The storage capacity available to the
            database, in GB. The minimum (and default) size
            is 10GB.
        zone (str):
            The Google Cloud Platform zone where your
            Cloud SQL database instance is located.
        secondary_zone (str):
            Optional. The Google Cloud Platform zone
            where the failover Cloud SQL database instance
            is located. Used when the Cloud SQL database
            availability type is REGIONAL (i.e. multiple
            zones / highly available).
        source_id (str):
            The Database Migration Service source connection profile ID,
            in the format:
            ``projects/my_project_name/locations/us-central1/connectionProfiles/connection_profile_ID``
        root_password_set (bool):
            Output only. Indicates If this connection
            profile root password is stored.
        collation (str):
            The Cloud SQL default instance level
            collation.
        cmek_key_name (str):
            The KMS key name used for the csql instance.
        availability_type (google.events.cloud.clouddms_v1.types.CloudSqlSettings.SqlAvailabilityType):
            Optional. Availability type. Potential values:

            -  ``ZONAL``: The instance serves data from only one zone.
               Outages in that zone affect data availability.
            -  ``REGIONAL``: The instance can serve data from more than
               one zone in a region (it is highly available).
    """
    class SqlActivationPolicy(proto.Enum):
        r"""Specifies when the instance should be activated.

        Values:
            SQL_ACTIVATION_POLICY_UNSPECIFIED (0):
                unspecified policy.
            ALWAYS (1):
                The instance is always up and running.
            NEVER (2):
                The instance should never spin up.
        """
        SQL_ACTIVATION_POLICY_UNSPECIFIED = 0
        ALWAYS = 1
        NEVER = 2

    class SqlDataDiskType(proto.Enum):
        r"""The storage options for Cloud SQL databases.

        Values:
            SQL_DATA_DISK_TYPE_UNSPECIFIED (0):
                Unspecified.
            PD_SSD (1):
                SSD disk.
            PD_HDD (2):
                HDD disk.
        """
        SQL_DATA_DISK_TYPE_UNSPECIFIED = 0
        PD_SSD = 1
        PD_HDD = 2

    class SqlDatabaseVersion(proto.Enum):
        r"""The database engine type and version.

        Values:
            SQL_DATABASE_VERSION_UNSPECIFIED (0):
                Unspecified version.
            MYSQL_5_6 (1):
                MySQL 5.6.
            MYSQL_5_7 (2):
                MySQL 5.7.
            POSTGRES_9_6 (3):
                PostgreSQL 9.6.
            POSTGRES_11 (4):
                PostgreSQL 11.
            POSTGRES_10 (5):
                PostgreSQL 10.
            MYSQL_8_0 (6):
                MySQL 8.0.
            POSTGRES_12 (7):
                PostgreSQL 12.
            POSTGRES_13 (8):
                PostgreSQL 13.
            POSTGRES_14 (17):
                PostgreSQL 14.
        """
        SQL_DATABASE_VERSION_UNSPECIFIED = 0
        MYSQL_5_6 = 1
        MYSQL_5_7 = 2
        POSTGRES_9_6 = 3
        POSTGRES_11 = 4
        POSTGRES_10 = 5
        MYSQL_8_0 = 6
        POSTGRES_12 = 7
        POSTGRES_13 = 8
        POSTGRES_14 = 17

    class SqlAvailabilityType(proto.Enum):
        r"""The availability type of the given Cloud SQL instance.

        Values:
            SQL_AVAILABILITY_TYPE_UNSPECIFIED (0):
                This is an unknown Availability type.
            ZONAL (1):
                Zonal availablility instance.
            REGIONAL (2):
                Regional availability instance.
        """
        SQL_AVAILABILITY_TYPE_UNSPECIFIED = 0
        ZONAL = 1
        REGIONAL = 2

    database_version: SqlDatabaseVersion = proto.Field(
        proto.ENUM,
        number=1,
        enum=SqlDatabaseVersion,
    )
    user_labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=2,
    )
    tier: str = proto.Field(
        proto.STRING,
        number=3,
    )
    storage_auto_resize_limit: wrappers_pb2.Int64Value = proto.Field(
        proto.MESSAGE,
        number=4,
        message=wrappers_pb2.Int64Value,
    )
    activation_policy: SqlActivationPolicy = proto.Field(
        proto.ENUM,
        number=5,
        enum=SqlActivationPolicy,
    )
    ip_config: 'SqlIpConfig' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='SqlIpConfig',
    )
    auto_storage_increase: wrappers_pb2.BoolValue = proto.Field(
        proto.MESSAGE,
        number=7,
        message=wrappers_pb2.BoolValue,
    )
    database_flags: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=8,
    )
    data_disk_type: SqlDataDiskType = proto.Field(
        proto.ENUM,
        number=9,
        enum=SqlDataDiskType,
    )
    data_disk_size_gb: wrappers_pb2.Int64Value = proto.Field(
        proto.MESSAGE,
        number=10,
        message=wrappers_pb2.Int64Value,
    )
    zone: str = proto.Field(
        proto.STRING,
        number=11,
    )
    secondary_zone: str = proto.Field(
        proto.STRING,
        number=18,
    )
    source_id: str = proto.Field(
        proto.STRING,
        number=12,
    )
    root_password_set: bool = proto.Field(
        proto.BOOL,
        number=14,
    )
    collation: str = proto.Field(
        proto.STRING,
        number=15,
    )
    cmek_key_name: str = proto.Field(
        proto.STRING,
        number=16,
    )
    availability_type: SqlAvailabilityType = proto.Field(
        proto.ENUM,
        number=17,
        enum=SqlAvailabilityType,
    )


class AlloyDbSettings(proto.Message):
    r"""Settings for creating an AlloyDB cluster.

    Attributes:
        vpc_network (str):
            Required. The resource link for the VPC network in which
            cluster resources are created and from which they are
            accessible via Private IP. The network must belong to the
            same project as the cluster. It is specified in the form:
            "projects/{project_number}/global/networks/{network_id}".
            This is required to create a cluster.
        labels (MutableMapping[str, str]):
            Labels for the AlloyDB cluster created by
            DMS. An object containing a list of 'key',
            'value' pairs.
        primary_instance_settings (google.events.cloud.clouddms_v1.types.AlloyDbSettings.PrimaryInstanceSettings):

    """

    class UserPassword(proto.Message):
        r"""The username/password for a database user. Used for
        specifying initial users at cluster creation time.

        Attributes:
            user (str):
                The database username.
            password_set (bool):
                Output only. Indicates if the initial_user.password field
                has been set.
        """

        user: str = proto.Field(
            proto.STRING,
            number=1,
        )
        password_set: bool = proto.Field(
            proto.BOOL,
            number=3,
        )

    class PrimaryInstanceSettings(proto.Message):
        r"""Settings for the cluster's primary instance

        Attributes:
            id (str):
                Required. The ID of the AlloyDB primary instance. The ID
                must satisfy the regex expression "[a-z0-9-]+".
            machine_config (google.events.cloud.clouddms_v1.types.AlloyDbSettings.PrimaryInstanceSettings.MachineConfig):
                Configuration for the machines that host the
                underlying database engine.
            database_flags (MutableMapping[str, str]):
                Database flags to pass to AlloyDB when DMS is
                creating the AlloyDB cluster and instances. See
                the AlloyDB documentation for how these can be
                used.
            labels (MutableMapping[str, str]):
                Labels for the AlloyDB primary instance
                created by DMS. An object containing a list of
                'key', 'value' pairs.
            private_ip (str):
                Output only. The private IP address for the
                Instance. This is the connection endpoint for an
                end-user application.
        """

        class MachineConfig(proto.Message):
            r"""MachineConfig describes the configuration of a machine.

            Attributes:
                cpu_count (int):
                    The number of CPU's in the VM instance.
            """

            cpu_count: int = proto.Field(
                proto.INT32,
                number=1,
            )

        id: str = proto.Field(
            proto.STRING,
            number=1,
        )
        machine_config: 'AlloyDbSettings.PrimaryInstanceSettings.MachineConfig' = proto.Field(
            proto.MESSAGE,
            number=2,
            message='AlloyDbSettings.PrimaryInstanceSettings.MachineConfig',
        )
        database_flags: MutableMapping[str, str] = proto.MapField(
            proto.STRING,
            proto.STRING,
            number=6,
        )
        labels: MutableMapping[str, str] = proto.MapField(
            proto.STRING,
            proto.STRING,
            number=7,
        )
        private_ip: str = proto.Field(
            proto.STRING,
            number=8,
        )

    vpc_network: str = proto.Field(
        proto.STRING,
        number=2,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=3,
    )
    primary_instance_settings: PrimaryInstanceSettings = proto.Field(
        proto.MESSAGE,
        number=4,
        message=PrimaryInstanceSettings,
    )


class StaticIpConnectivity(proto.Message):
    r"""The source database will allow incoming connections from the
    destination database's public IP. You can retrieve the Cloud SQL
    instance's public IP from the Cloud SQL console or using Cloud
    SQL APIs. No additional configuration is required.

    """


class ReverseSshConnectivity(proto.Message):
    r"""The details needed to configure a reverse SSH tunnel between
    the source and destination databases. These details will be used
    when calling the generateSshScript method (see
    https://cloud.google.com/database-migration/docs/reference/rest/v1/projects.locations.migrationJobs/generateSshScript)
    to produce the script that will help set up the reverse SSH
    tunnel, and to set up the VPC peering between the Cloud SQL
    private network and the VPC.

    Attributes:
        vm_ip (str):
            Required. The IP of the virtual machine
            (Compute Engine) used as the bastion server for
            the SSH tunnel.
        vm_port (int):
            Required. The forwarding port of the virtual
            machine (Compute Engine) used as the bastion
            server for the SSH tunnel.
        vm (str):
            The name of the virtual machine (Compute
            Engine) used as the bastion server for the SSH
            tunnel.
        vpc (str):
            The name of the VPC to peer with the Cloud
            SQL private network.
    """

    vm_ip: str = proto.Field(
        proto.STRING,
        number=1,
    )
    vm_port: int = proto.Field(
        proto.INT32,
        number=2,
    )
    vm: str = proto.Field(
        proto.STRING,
        number=3,
    )
    vpc: str = proto.Field(
        proto.STRING,
        number=4,
    )


class VpcPeeringConnectivity(proto.Message):
    r"""The details of the VPC where the source database is located
    in Google Cloud. We will use this information to set up the VPC
    peering connection between Cloud SQL and this VPC.

    Attributes:
        vpc (str):
            The name of the VPC network to peer with the
            Cloud SQL private network.
    """

    vpc: str = proto.Field(
        proto.STRING,
        number=1,
    )


class DatabaseType(proto.Message):
    r"""A message defining the database engine and provider.

    Attributes:
        provider (google.events.cloud.clouddms_v1.types.DatabaseProvider):
            The database provider.
        engine (google.events.cloud.clouddms_v1.types.DatabaseEngine):
            The database engine.
    """

    provider: 'DatabaseProvider' = proto.Field(
        proto.ENUM,
        number=1,
        enum='DatabaseProvider',
    )
    engine: 'DatabaseEngine' = proto.Field(
        proto.ENUM,
        number=2,
        enum='DatabaseEngine',
    )


class MigrationJob(proto.Message):
    r"""Represents a Database Migration Service migration job object.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            The name (URI) of this migration job
            resource, in the form of:
            projects/{project}/locations/{location}/migrationJobs/{migrationJob}.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The timestamp when the migration
            job resource was created. A timestamp in RFC3339
            UTC "Zulu" format, accurate to nanoseconds.
            Example: "2014-10-02T15:01:23.045123456Z".
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The timestamp when the migration
            job resource was last updated. A timestamp in
            RFC3339 UTC "Zulu" format, accurate to
            nanoseconds. Example:
            "2014-10-02T15:01:23.045123456Z".
        labels (MutableMapping[str, str]):
            The resource labels for migration job to use to annotate any
            related underlying resources such as Compute Engine VMs. An
            object containing a list of "key": "value" pairs.

            Example:
            ``{ "name": "wrench", "mass": "1.3kg", "count": "3" }``.
        display_name (str):
            The migration job display name.
        state (google.events.cloud.clouddms_v1.types.MigrationJob.State):
            The current migration job state.
        phase (google.events.cloud.clouddms_v1.types.MigrationJob.Phase):
            Output only. The current migration job phase.
        type_ (google.events.cloud.clouddms_v1.types.MigrationJob.Type):
            Required. The migration job type.
        dump_path (str):
            The path to the dump file in Google Cloud Storage, in the
            format: (gs://[BUCKET_NAME]/[OBJECT_NAME]). This field and
            the "dump_flags" field are mutually exclusive.
        dump_flags (google.events.cloud.clouddms_v1.types.MigrationJob.DumpFlags):
            The initial dump flags. This field and the "dump_path" field
            are mutually exclusive.
        source (str):
            Required. The resource name (URI) of the
            source connection profile.
        destination (str):
            Required. The resource name (URI) of the
            destination connection profile.
        reverse_ssh_connectivity (google.events.cloud.clouddms_v1.types.ReverseSshConnectivity):
            The details needed to communicate to the
            source over Reverse SSH tunnel connectivity.

            This field is a member of `oneof`_ ``connectivity``.
        vpc_peering_connectivity (google.events.cloud.clouddms_v1.types.VpcPeeringConnectivity):
            The details of the VPC network that the
            source database is located in.

            This field is a member of `oneof`_ ``connectivity``.
        static_ip_connectivity (google.events.cloud.clouddms_v1.types.StaticIpConnectivity):
            static ip connectivity data (default, no
            additional details needed).

            This field is a member of `oneof`_ ``connectivity``.
        duration (google.protobuf.duration_pb2.Duration):
            Output only. The duration of the migration
            job (in seconds). A duration in seconds with up
            to nine fractional digits, terminated by 's'.
            Example:

            "3.5s".
        error (google.rpc.status_pb2.Status):
            Output only. The error details in case of
            state FAILED.
        source_database (google.events.cloud.clouddms_v1.types.DatabaseType):
            The database engine type and provider of the
            source.
        destination_database (google.events.cloud.clouddms_v1.types.DatabaseType):
            The database engine type and provider of the
            destination.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. If the migration job is
            completed, the time when it was completed.
    """
    class State(proto.Enum):
        r"""The current migration job states.

        Values:
            STATE_UNSPECIFIED (0):
                The state of the migration job is unknown.
            MAINTENANCE (1):
                The migration job is down for maintenance.
            DRAFT (2):
                The migration job is in draft mode and no
                resources are created.
            CREATING (3):
                The migration job is being created.
            NOT_STARTED (4):
                The migration job is created and not started.
            RUNNING (5):
                The migration job is running.
            FAILED (6):
                The migration job failed.
            COMPLETED (7):
                The migration job has been completed.
            DELETING (8):
                The migration job is being deleted.
            STOPPING (9):
                The migration job is being stopped.
            STOPPED (10):
                The migration job is currently stopped.
            DELETED (11):
                The migration job has been deleted.
            UPDATING (12):
                The migration job is being updated.
            STARTING (13):
                The migration job is starting.
            RESTARTING (14):
                The migration job is restarting.
            RESUMING (15):
                The migration job is resuming.
        """
        STATE_UNSPECIFIED = 0
        MAINTENANCE = 1
        DRAFT = 2
        CREATING = 3
        NOT_STARTED = 4
        RUNNING = 5
        FAILED = 6
        COMPLETED = 7
        DELETING = 8
        STOPPING = 9
        STOPPED = 10
        DELETED = 11
        UPDATING = 12
        STARTING = 13
        RESTARTING = 14
        RESUMING = 15

    class Phase(proto.Enum):
        r"""The current migration job phase.

        Values:
            PHASE_UNSPECIFIED (0):
                The phase of the migration job is unknown.
            FULL_DUMP (1):
                The migration job is in the full dump phase.
            CDC (2):
                The migration job is CDC phase.
            PROMOTE_IN_PROGRESS (3):
                The migration job is running the promote
                phase.
            WAITING_FOR_SOURCE_WRITES_TO_STOP (4):
                Only RDS flow - waiting for source writes to
                stop
            PREPARING_THE_DUMP (5):
                Only RDS flow - the sources writes stopped,
                waiting for dump to begin
        """
        PHASE_UNSPECIFIED = 0
        FULL_DUMP = 1
        CDC = 2
        PROMOTE_IN_PROGRESS = 3
        WAITING_FOR_SOURCE_WRITES_TO_STOP = 4
        PREPARING_THE_DUMP = 5

    class Type(proto.Enum):
        r"""The type of migration job (one-time or continuous).

        Values:
            TYPE_UNSPECIFIED (0):
                The type of the migration job is unknown.
            ONE_TIME (1):
                The migration job is a one time migration.
            CONTINUOUS (2):
                The migration job is a continuous migration.
        """
        TYPE_UNSPECIFIED = 0
        ONE_TIME = 1
        CONTINUOUS = 2

    class DumpFlag(proto.Message):
        r"""Dump flag definition.

        Attributes:
            name (str):
                The name of the flag
            value (str):
                The value of the flag.
        """

        name: str = proto.Field(
            proto.STRING,
            number=1,
        )
        value: str = proto.Field(
            proto.STRING,
            number=2,
        )

    class DumpFlags(proto.Message):
        r"""Dump flags definition.

        Attributes:
            dump_flags (MutableSequence[google.events.cloud.clouddms_v1.types.MigrationJob.DumpFlag]):
                The flags for the initial dump.
        """

        dump_flags: MutableSequence['MigrationJob.DumpFlag'] = proto.RepeatedField(
            proto.MESSAGE,
            number=1,
            message='MigrationJob.DumpFlag',
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
    state: State = proto.Field(
        proto.ENUM,
        number=6,
        enum=State,
    )
    phase: Phase = proto.Field(
        proto.ENUM,
        number=7,
        enum=Phase,
    )
    type_: Type = proto.Field(
        proto.ENUM,
        number=8,
        enum=Type,
    )
    dump_path: str = proto.Field(
        proto.STRING,
        number=9,
    )
    dump_flags: DumpFlags = proto.Field(
        proto.MESSAGE,
        number=17,
        message=DumpFlags,
    )
    source: str = proto.Field(
        proto.STRING,
        number=10,
    )
    destination: str = proto.Field(
        proto.STRING,
        number=11,
    )
    reverse_ssh_connectivity: 'ReverseSshConnectivity' = proto.Field(
        proto.MESSAGE,
        number=101,
        oneof='connectivity',
        message='ReverseSshConnectivity',
    )
    vpc_peering_connectivity: 'VpcPeeringConnectivity' = proto.Field(
        proto.MESSAGE,
        number=102,
        oneof='connectivity',
        message='VpcPeeringConnectivity',
    )
    static_ip_connectivity: 'StaticIpConnectivity' = proto.Field(
        proto.MESSAGE,
        number=103,
        oneof='connectivity',
        message='StaticIpConnectivity',
    )
    duration: duration_pb2.Duration = proto.Field(
        proto.MESSAGE,
        number=12,
        message=duration_pb2.Duration,
    )
    error: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=13,
        message=status_pb2.Status,
    )
    source_database: 'DatabaseType' = proto.Field(
        proto.MESSAGE,
        number=14,
        message='DatabaseType',
    )
    destination_database: 'DatabaseType' = proto.Field(
        proto.MESSAGE,
        number=15,
        message='DatabaseType',
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=16,
        message=timestamp_pb2.Timestamp,
    )


class ConnectionProfile(proto.Message):
    r"""A connection profile definition.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            The name of this connection profile resource
            in the form of
            projects/{project}/locations/{location}/connectionProfiles/{connectionProfile}.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The timestamp when the resource
            was created. A timestamp in RFC3339 UTC "Zulu"
            format, accurate to nanoseconds. Example:
            "2014-10-02T15:01:23.045123456Z".
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The timestamp when the resource
            was last updated. A timestamp in RFC3339 UTC
            "Zulu" format, accurate to nanoseconds. Example:
            "2014-10-02T15:01:23.045123456Z".
        labels (MutableMapping[str, str]):
            The resource labels for connection profile to use to
            annotate any related underlying resources such as Compute
            Engine VMs. An object containing a list of "key": "value"
            pairs.

            Example:
            ``{ "name": "wrench", "mass": "1.3kg", "count": "3" }``.
        state (google.events.cloud.clouddms_v1.types.ConnectionProfile.State):
            The current connection profile state (e.g.
            DRAFT, READY, or FAILED).
        display_name (str):
            The connection profile display name.
        mysql (google.events.cloud.clouddms_v1.types.MySqlConnectionProfile):
            A MySQL database connection profile.

            This field is a member of `oneof`_ ``connection_profile``.
        postgresql (google.events.cloud.clouddms_v1.types.PostgreSqlConnectionProfile):
            A PostgreSQL database connection profile.

            This field is a member of `oneof`_ ``connection_profile``.
        cloudsql (google.events.cloud.clouddms_v1.types.CloudSqlConnectionProfile):
            A CloudSQL database connection profile.

            This field is a member of `oneof`_ ``connection_profile``.
        alloydb (google.events.cloud.clouddms_v1.types.AlloyDbConnectionProfile):
            An AlloyDB cluster connection profile.

            This field is a member of `oneof`_ ``connection_profile``.
        error (google.rpc.status_pb2.Status):
            Output only. The error details in case of
            state FAILED.
        provider (google.events.cloud.clouddms_v1.types.DatabaseProvider):
            The database provider.
    """
    class State(proto.Enum):
        r"""The current connection profile state (e.g. DRAFT, READY, or
        FAILED).

        Values:
            STATE_UNSPECIFIED (0):
                The state of the connection profile is
                unknown.
            DRAFT (1):
                The connection profile is in draft mode and
                fully editable.
            CREATING (2):
                The connection profile is being created.
            READY (3):
                The connection profile is ready.
            UPDATING (4):
                The connection profile is being updated.
            DELETING (5):
                The connection profile is being deleted.
            DELETED (6):
                The connection profile has been deleted.
            FAILED (7):
                The last action on the connection profile
                failed.
        """
        STATE_UNSPECIFIED = 0
        DRAFT = 1
        CREATING = 2
        READY = 3
        UPDATING = 4
        DELETING = 5
        DELETED = 6
        FAILED = 7

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
    state: State = proto.Field(
        proto.ENUM,
        number=5,
        enum=State,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=6,
    )
    mysql: 'MySqlConnectionProfile' = proto.Field(
        proto.MESSAGE,
        number=100,
        oneof='connection_profile',
        message='MySqlConnectionProfile',
    )
    postgresql: 'PostgreSqlConnectionProfile' = proto.Field(
        proto.MESSAGE,
        number=101,
        oneof='connection_profile',
        message='PostgreSqlConnectionProfile',
    )
    cloudsql: 'CloudSqlConnectionProfile' = proto.Field(
        proto.MESSAGE,
        number=102,
        oneof='connection_profile',
        message='CloudSqlConnectionProfile',
    )
    alloydb: 'AlloyDbConnectionProfile' = proto.Field(
        proto.MESSAGE,
        number=105,
        oneof='connection_profile',
        message='AlloyDbConnectionProfile',
    )
    error: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=7,
        message=status_pb2.Status,
    )
    provider: 'DatabaseProvider' = proto.Field(
        proto.ENUM,
        number=8,
        enum='DatabaseProvider',
    )


class ConnectionProfileEventData(proto.Message):
    r"""The data within all ConnectionProfile events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.clouddms_v1.types.ConnectionProfile):
            Optional. The ConnectionProfile event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'ConnectionProfile' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='ConnectionProfile',
    )


class MigrationJobEventData(proto.Message):
    r"""The data within all MigrationJob events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.clouddms_v1.types.MigrationJob):
            Optional. The MigrationJob event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'MigrationJob' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='MigrationJob',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
