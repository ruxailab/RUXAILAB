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
from google.type import dayofweek_pb2  # type: ignore
from google.type import timeofday_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.memcache.v1',
    manifest={
        'MemcacheVersion',
        'Instance',
        'MaintenancePolicy',
        'WeeklyMaintenanceWindow',
        'MaintenanceSchedule',
        'MemcacheParameters',
        'InstanceEventData',
    },
)


class MemcacheVersion(proto.Enum):
    r"""Memcached versions supported by our service.

    Values:
        MEMCACHE_VERSION_UNSPECIFIED (0):
            No description available.
        MEMCACHE_1_5 (1):
            Memcached 1.5 version.
    """
    MEMCACHE_VERSION_UNSPECIFIED = 0
    MEMCACHE_1_5 = 1


class Instance(proto.Message):
    r"""A Memorystore for Memcached instance

    Attributes:
        name (str):
            Required. Unique name of the resource in this scope
            including project and location using the form:
            ``projects/{project_id}/locations/{location_id}/instances/{instance_id}``

            Note: Memcached instances are managed and addressed at the
            regional level so ``location_id`` here refers to a Google
            Cloud region; however, users may choose which zones
            Memcached nodes should be provisioned in within an instance.
            Refer to [zones][google.cloud.memcache.v1.Instance.zones]
            field for more details.
        display_name (str):
            User provided name for the instance, which is
            only used for display purposes. Cannot be more
            than 80 characters.
        labels (MutableMapping[str, str]):
            Resource labels to represent user-provided
            metadata. Refer to cloud documentation on labels
            for more details.
            https://cloud.google.com/compute/docs/labeling-resources
        authorized_network (str):
            The full name of the Google Compute Engine
            `network </compute/docs/networks-and-firewalls#networks>`__
            to which the instance is connected. If left unspecified, the
            ``default`` network will be used.
        zones (MutableSequence[str]):
            Zones in which Memcached nodes should be
            provisioned. Memcached nodes will be equally
            distributed across these zones. If not provided,
            the service will by default create nodes in all
            zones in the region for the instance.
        node_count (int):
            Required. Number of nodes in the Memcached
            instance.
        node_config (google.events.cloud.memcache_v1.types.Instance.NodeConfig):
            Required. Configuration for Memcached nodes.
        memcache_version (google.events.cloud.memcache_v1.types.MemcacheVersion):
            The major version of Memcached software. If not provided,
            latest supported version will be used. Currently the latest
            supported major version is ``MEMCACHE_1_5``. The minor
            version will be automatically determined by our system based
            on the latest supported minor version.
        parameters (google.events.cloud.memcache_v1.types.MemcacheParameters):
            User defined parameters to apply to the
            memcached process on each node.
        memcache_nodes (MutableSequence[google.events.cloud.memcache_v1.types.Instance.Node]):
            Output only. List of Memcached nodes. Refer to
            [Node][google.cloud.memcache.v1.Instance.Node] message for
            more details.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the instance was
            created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the instance was
            updated.
        state (google.events.cloud.memcache_v1.types.Instance.State):
            Output only. The state of this Memcached
            instance.
        memcache_full_version (str):
            Output only. The full version of memcached
            server running on this instance. System
            automatically determines the full memcached
            version for an instance based on the input
            MemcacheVersion.
            The full version format will be
            "memcached-1.5.16".
        instance_messages (MutableSequence[google.events.cloud.memcache_v1.types.Instance.InstanceMessage]):
            List of messages that describe the current
            state of the Memcached instance.
        discovery_endpoint (str):
            Output only. Endpoint for the Discovery API.
        maintenance_policy (google.events.cloud.memcache_v1.types.MaintenancePolicy):
            The maintenance policy for the instance. If
            not provided, the maintenance event will be
            performed based on Memorystore internal rollout
            schedule.
        maintenance_schedule (google.events.cloud.memcache_v1.types.MaintenanceSchedule):
            Output only. Published maintenance schedule.
    """
    class State(proto.Enum):
        r"""Different states of a Memcached instance.

        Values:
            STATE_UNSPECIFIED (0):
                State not set.
            CREATING (1):
                Memcached instance is being created.
            READY (2):
                Memcached instance has been created and ready
                to be used.
            UPDATING (3):
                Memcached instance is updating configuration
                such as maintenance policy and schedule.
            DELETING (4):
                Memcached instance is being deleted.
            PERFORMING_MAINTENANCE (5):
                Memcached instance is going through
                maintenance, e.g. data plane rollout.
        """
        STATE_UNSPECIFIED = 0
        CREATING = 1
        READY = 2
        UPDATING = 3
        DELETING = 4
        PERFORMING_MAINTENANCE = 5

    class NodeConfig(proto.Message):
        r"""Configuration for a Memcached Node.

        Attributes:
            cpu_count (int):
                Required. Number of cpus per Memcached node.
            memory_size_mb (int):
                Required. Memory size in MiB for each
                Memcached node.
        """

        cpu_count: int = proto.Field(
            proto.INT32,
            number=1,
        )
        memory_size_mb: int = proto.Field(
            proto.INT32,
            number=2,
        )

    class Node(proto.Message):
        r"""

        Attributes:
            node_id (str):
                Output only. Identifier of the Memcached
                node. The node id does not include project or
                location like the Memcached instance name.
            zone (str):
                Output only. Location (GCP Zone) for the
                Memcached node.
            state (google.events.cloud.memcache_v1.types.Instance.Node.State):
                Output only. Current state of the Memcached
                node.
            host (str):
                Output only. Hostname or IP address of the
                Memcached node used by the clients to connect to
                the Memcached server on this node.
            port (int):
                Output only. The port number of the Memcached
                server on this node.
            parameters (google.events.cloud.memcache_v1.types.MemcacheParameters):
                User defined parameters currently applied to
                the node.
        """
        class State(proto.Enum):
            r"""Different states of a Memcached node.

            Values:
                STATE_UNSPECIFIED (0):
                    Node state is not set.
                CREATING (1):
                    Node is being created.
                READY (2):
                    Node has been created and ready to be used.
                DELETING (3):
                    Node is being deleted.
                UPDATING (4):
                    Node is being updated.
            """
            STATE_UNSPECIFIED = 0
            CREATING = 1
            READY = 2
            DELETING = 3
            UPDATING = 4

        node_id: str = proto.Field(
            proto.STRING,
            number=1,
        )
        zone: str = proto.Field(
            proto.STRING,
            number=2,
        )
        state: 'Instance.Node.State' = proto.Field(
            proto.ENUM,
            number=3,
            enum='Instance.Node.State',
        )
        host: str = proto.Field(
            proto.STRING,
            number=4,
        )
        port: int = proto.Field(
            proto.INT32,
            number=5,
        )
        parameters: 'MemcacheParameters' = proto.Field(
            proto.MESSAGE,
            number=6,
            message='MemcacheParameters',
        )

    class InstanceMessage(proto.Message):
        r"""

        Attributes:
            code (google.events.cloud.memcache_v1.types.Instance.InstanceMessage.Code):
                A code that correspond to one type of
                user-facing message.
            message (str):
                Message on memcached instance which will be
                exposed to users.
        """
        class Code(proto.Enum):
            r"""

            Values:
                CODE_UNSPECIFIED (0):
                    Message Code not set.
                ZONE_DISTRIBUTION_UNBALANCED (1):
                    Memcached nodes are distributed unevenly.
            """
            CODE_UNSPECIFIED = 0
            ZONE_DISTRIBUTION_UNBALANCED = 1

        code: 'Instance.InstanceMessage.Code' = proto.Field(
            proto.ENUM,
            number=1,
            enum='Instance.InstanceMessage.Code',
        )
        message: str = proto.Field(
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
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=3,
    )
    authorized_network: str = proto.Field(
        proto.STRING,
        number=4,
    )
    zones: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=5,
    )
    node_count: int = proto.Field(
        proto.INT32,
        number=6,
    )
    node_config: NodeConfig = proto.Field(
        proto.MESSAGE,
        number=7,
        message=NodeConfig,
    )
    memcache_version: 'MemcacheVersion' = proto.Field(
        proto.ENUM,
        number=9,
        enum='MemcacheVersion',
    )
    parameters: 'MemcacheParameters' = proto.Field(
        proto.MESSAGE,
        number=11,
        message='MemcacheParameters',
    )
    memcache_nodes: MutableSequence[Node] = proto.RepeatedField(
        proto.MESSAGE,
        number=12,
        message=Node,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=13,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=14,
        message=timestamp_pb2.Timestamp,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=15,
        enum=State,
    )
    memcache_full_version: str = proto.Field(
        proto.STRING,
        number=18,
    )
    instance_messages: MutableSequence[InstanceMessage] = proto.RepeatedField(
        proto.MESSAGE,
        number=19,
        message=InstanceMessage,
    )
    discovery_endpoint: str = proto.Field(
        proto.STRING,
        number=20,
    )
    maintenance_policy: 'MaintenancePolicy' = proto.Field(
        proto.MESSAGE,
        number=21,
        message='MaintenancePolicy',
    )
    maintenance_schedule: 'MaintenanceSchedule' = proto.Field(
        proto.MESSAGE,
        number=22,
        message='MaintenanceSchedule',
    )


class MaintenancePolicy(proto.Message):
    r"""Maintenance policy per instance.

    Attributes:
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the policy was
            created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time when the policy was
            updated.
        description (str):
            Description of what this policy is for. Create/Update
            methods return INVALID_ARGUMENT if the length is greater
            than 512.
        weekly_maintenance_window (MutableSequence[google.events.cloud.memcache_v1.types.WeeklyMaintenanceWindow]):
            Required. Maintenance window that is applied to resources
            covered by this policy. Minimum 1. For the current version,
            the maximum number of weekly_maintenance_windows is expected
            to be one.
    """

    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    weekly_maintenance_window: MutableSequence['WeeklyMaintenanceWindow'] = proto.RepeatedField(
        proto.MESSAGE,
        number=4,
        message='WeeklyMaintenanceWindow',
    )


class WeeklyMaintenanceWindow(proto.Message):
    r"""Time window specified for weekly operations.

    Attributes:
        day (google.type.dayofweek_pb2.DayOfWeek):
            Required. Allows to define schedule that runs
            specified day of the week.
        start_time (google.type.timeofday_pb2.TimeOfDay):
            Required. Start time of the window in UTC.
        duration (google.protobuf.duration_pb2.Duration):
            Required. Duration of the time window.
    """

    day: dayofweek_pb2.DayOfWeek = proto.Field(
        proto.ENUM,
        number=1,
        enum=dayofweek_pb2.DayOfWeek,
    )
    start_time: timeofday_pb2.TimeOfDay = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timeofday_pb2.TimeOfDay,
    )
    duration: duration_pb2.Duration = proto.Field(
        proto.MESSAGE,
        number=3,
        message=duration_pb2.Duration,
    )


class MaintenanceSchedule(proto.Message):
    r"""Upcoming maintenance schedule.

    Attributes:
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The start time of any upcoming
            scheduled maintenance for this instance.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The end time of any upcoming
            scheduled maintenance for this instance.
        schedule_deadline_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The deadline that the
            maintenance schedule start time can not go
            beyond, including reschedule.
    """

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
    schedule_deadline_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )


class MemcacheParameters(proto.Message):
    r"""

    Attributes:
        id (str):
            Output only. The unique ID associated with
            this set of parameters. Users can use this id to
            determine if the parameters associated with the
            instance differ from the parameters associated
            with the nodes. A discrepancy between parameter
            ids can inform users that they may need to take
            action to apply parameters on nodes.
        params (MutableMapping[str, str]):
            User defined set of parameters to use in the
            memcached process.
    """

    id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    params: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=3,
    )


class InstanceEventData(proto.Message):
    r"""The data within all Instance events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.memcache_v1.types.Instance):
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


__all__ = tuple(sorted(__protobuf__.manifest))
