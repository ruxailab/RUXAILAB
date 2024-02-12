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
from google.rpc import status_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.networkconnectivity.v1',
    manifest={
        'Infrastructure',
        'ConnectionErrorType',
        'State',
        'ServiceConnectionMap',
        'ServiceConnectionPolicy',
        'ServiceClass',
        'ServiceConnectionToken',
        'Hub',
        'RoutingVPC',
        'Spoke',
        'LinkedVpnTunnels',
        'LinkedInterconnectAttachments',
        'LinkedRouterApplianceInstances',
        'RouterApplianceInstance',
        'ServiceClassEventData',
        'ServiceConnectionTokenEventData',
        'ServiceConnectionMapEventData',
        'HubEventData',
        'SpokeEventData',
        'ServiceConnectionPolicyEventData',
    },
)


class Infrastructure(proto.Enum):
    r"""The infrastructure used for connections between
    consumers/producers.

    Values:
        INFRASTRUCTURE_UNSPECIFIED (0):
            An invalid infrastructure as the default
            case.
        PSC (1):
            Private Service Connect is used for
            connections.
    """
    INFRASTRUCTURE_UNSPECIFIED = 0
    PSC = 1


class ConnectionErrorType(proto.Enum):
    r"""The error type indicates whether a connection error is
    consumer facing, producer facing or system internal.

    Values:
        CONNECTION_ERROR_TYPE_UNSPECIFIED (0):
            An invalid error type as the default case.
        ERROR_INTERNAL (1):
            The error is due to Service Automation system
            internal.
        ERROR_CONSUMER_SIDE (2):
            The error is due to the setup on consumer
            side.
        ERROR_PRODUCER_SIDE (3):
            The error is due to the setup on producer
            side.
    """
    CONNECTION_ERROR_TYPE_UNSPECIFIED = 0
    ERROR_INTERNAL = 1
    ERROR_CONSUMER_SIDE = 2
    ERROR_PRODUCER_SIDE = 3


class State(proto.Enum):
    r"""The State enum represents the lifecycle stage of a Network
    Connectivity Center resource.

    Values:
        STATE_UNSPECIFIED (0):
            No state information available
        CREATING (1):
            The resource's create operation is in
            progress.
        ACTIVE (2):
            The resource is active
        DELETING (3):
            The resource's delete operation is in
            progress.
        UPDATING (6):
            The resource's update operation is in
            progress.
    """
    STATE_UNSPECIFIED = 0
    CREATING = 1
    ACTIVE = 2
    DELETING = 3
    UPDATING = 6


class ServiceConnectionMap(proto.Message):
    r"""The ServiceConnectionMap resource.
    Next id: 14

    Attributes:
        name (str):
            Immutable. The name of a ServiceConnectionMap. Format:
            projects/{project}/locations/{location}/serviceConnectionMaps/{service_connection_map}
            See:
            https://google.aip.dev/122#fields-representing-resource-names
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time when the
            ServiceConnectionMap was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time when the
            ServiceConnectionMap was updated.
        labels (MutableMapping[str, str]):
            User-defined labels.
        description (str):
            A description of this resource.
        service_class (str):
            The service class identifier this
            ServiceConnectionMap is for. The user of
            ServiceConnectionMap create API needs to have
            networkconnecitivty.serviceclasses.use iam
            permission for the service class.
        service_class_uri (str):
            Output only. The service class uri this
            ServiceConnectionMap is for.
        infrastructure (google.events.cloud.networkconnectivity_v1.types.Infrastructure):
            Output only. The infrastructure used for
            connections between consumers/producers.
        producer_psc_configs (MutableSequence[google.events.cloud.networkconnectivity_v1.types.ServiceConnectionMap.ProducerPscConfig]):
            The PSC configurations on producer side.
        consumer_psc_configs (MutableSequence[google.events.cloud.networkconnectivity_v1.types.ServiceConnectionMap.ConsumerPscConfig]):
            The PSC configurations on consumer side.
        consumer_psc_connections (MutableSequence[google.events.cloud.networkconnectivity_v1.types.ServiceConnectionMap.ConsumerPscConnection]):
            Output only. PSC connection details on
            consumer side.
    """

    class ProducerPscConfig(proto.Message):
        r"""The PSC configurations on producer side.

        Attributes:
            service_attachment_uri (str):
                The resource path of a service attachment.
                Example:

                projects/{projectNumOrId}/regions/{region}/serviceAttachments/{resourceId}.
        """

        service_attachment_uri: str = proto.Field(
            proto.STRING,
            number=1,
        )

    class ConsumerPscConfig(proto.Message):
        r"""Allow the producer to specify which consumers can connect to
        it.

        Attributes:
            project (str):
                The consumer project where PSC connections
                are allowed to be created in.
            network (str):
                The resource path of the consumer network
                where PSC connections are allowed to be created
                in. Note, this network does not need be in the
                ConsumerPscConfig.project in the case of
                SharedVPC. Example:

                projects/{projectNumOrId}/global/networks/{networkId}.
            disable_global_access (bool):
                This is used in PSC consumer ForwardingRule
                to control whether the PSC endpoint can be
                accessed from another region.
            state (google.events.cloud.networkconnectivity_v1.types.ServiceConnectionMap.ConsumerPscConfig.State):
                Output only. Overall state of PSC Connections
                management for this consumer psc config.
        """
        class State(proto.Enum):
            r"""PSC Consumer Config State.

            Values:
                STATE_UNSPECIFIED (0):
                    Default state, when Connection Map is created
                    initially.
                VALID (1):
                    Set when policy and map configuration is
                    valid, and their matching can lead to allowing
                    creation of PSC Connections subject to other
                    constraints like connections limit.
                CONNECTION_POLICY_MISSING (2):
                    No Service Connection Policy found for this
                    network and Service Class
            """
            STATE_UNSPECIFIED = 0
            VALID = 1
            CONNECTION_POLICY_MISSING = 2

        project: str = proto.Field(
            proto.STRING,
            number=1,
        )
        network: str = proto.Field(
            proto.STRING,
            number=2,
        )
        disable_global_access: bool = proto.Field(
            proto.BOOL,
            number=3,
        )
        state: 'ServiceConnectionMap.ConsumerPscConfig.State' = proto.Field(
            proto.ENUM,
            number=4,
            enum='ServiceConnectionMap.ConsumerPscConfig.State',
        )

    class ConsumerPscConnection(proto.Message):
        r"""PSC connection details on consumer side.

        Attributes:
            service_attachment_uri (str):
                The URI of a service attachment which is the
                target of the PSC connection.
            state (google.events.cloud.networkconnectivity_v1.types.ServiceConnectionMap.ConsumerPscConnection.State):
                The state of the PSC connection.
            project (str):
                The consumer project whose PSC forwarding
                rule is connected to the service attachments in
                this service connection map.
            network (str):
                The consumer network whose PSC forwarding
                rule is connected to the service attachments in
                this service connection map. Note that the
                network could be on a different project (shared
                VPC).
            psc_connection_id (str):
                The PSC connection id of the PSC forwarding
                rule connected to the service attachments in
                this service connection map.
            ip (str):
                The IP literal allocated on the consumer
                network for the PSC forwarding rule that is
                created to connect to the producer service
                attachment in this service connection map.
            error_type (google.events.cloud.networkconnectivity_v1.types.ConnectionErrorType):
                The error type indicates whether the error is
                consumer facing, producer facing or system
                internal.
            error (google.rpc.status_pb2.Status):
                The most recent error during operating this
                connection.
            gce_operation (str):
                The last Compute Engine operation to setup
                PSC connection.
            forwarding_rule (str):
                The URI of the consumer forwarding rule
                created. Example:

                projects/{projectNumOrId}/regions/us-east1/networks/{resourceId}.
        """
        class State(proto.Enum):
            r"""The state of the PSC connection.

            Values:
                STATE_UNSPECIFIED (0):
                    An invalid state as the default case.
                ACTIVE (1):
                    The connection is fully established and ready
                    to use.
                FAILED (2):
                    The connection is not functional since some
                    resources on the connection fail to be created.
                CREATING (3):
                    The connection is being created.
                DELETING (4):
                    The connection is being deleted.
            """
            STATE_UNSPECIFIED = 0
            ACTIVE = 1
            FAILED = 2
            CREATING = 3
            DELETING = 4

        service_attachment_uri: str = proto.Field(
            proto.STRING,
            number=1,
        )
        state: 'ServiceConnectionMap.ConsumerPscConnection.State' = proto.Field(
            proto.ENUM,
            number=2,
            enum='ServiceConnectionMap.ConsumerPscConnection.State',
        )
        project: str = proto.Field(
            proto.STRING,
            number=3,
        )
        network: str = proto.Field(
            proto.STRING,
            number=4,
        )
        psc_connection_id: str = proto.Field(
            proto.STRING,
            number=5,
        )
        ip: str = proto.Field(
            proto.STRING,
            number=6,
        )
        error_type: 'ConnectionErrorType' = proto.Field(
            proto.ENUM,
            number=7,
            enum='ConnectionErrorType',
        )
        error: status_pb2.Status = proto.Field(
            proto.MESSAGE,
            number=8,
            message=status_pb2.Status,
        )
        gce_operation: str = proto.Field(
            proto.STRING,
            number=9,
        )
        forwarding_rule: str = proto.Field(
            proto.STRING,
            number=10,
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
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    service_class: str = proto.Field(
        proto.STRING,
        number=7,
    )
    service_class_uri: str = proto.Field(
        proto.STRING,
        number=12,
    )
    infrastructure: 'Infrastructure' = proto.Field(
        proto.ENUM,
        number=8,
        enum='Infrastructure',
    )
    producer_psc_configs: MutableSequence[ProducerPscConfig] = proto.RepeatedField(
        proto.MESSAGE,
        number=9,
        message=ProducerPscConfig,
    )
    consumer_psc_configs: MutableSequence[ConsumerPscConfig] = proto.RepeatedField(
        proto.MESSAGE,
        number=10,
        message=ConsumerPscConfig,
    )
    consumer_psc_connections: MutableSequence[ConsumerPscConnection] = proto.RepeatedField(
        proto.MESSAGE,
        number=11,
        message=ConsumerPscConnection,
    )


class ServiceConnectionPolicy(proto.Message):
    r"""The ServiceConnectionPolicy resource.
    Next id: 11

    Attributes:
        name (str):
            Immutable. The name of a ServiceConnectionPolicy. Format:
            projects/{project}/locations/{location}/serviceConnectionPolicies/{service_connection_policy}
            See:
            https://google.aip.dev/122#fields-representing-resource-names
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time when the
            ServiceConnectionMap was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time when the
            ServiceConnectionMap was updated.
        labels (MutableMapping[str, str]):
            User-defined labels.
        description (str):
            A description of this resource.
        network (str):
            The resource path of the consumer network.
            Example:

            -
              projects/{projectNumOrId}/global/networks/{resourceId}.
        service_class (str):
            The service class identifier for which this
            ServiceConnectionPolicy is for. The service
            class identifier is a unique, symbolic
            representation of a ServiceClass. It is provided
            by the Service Producer. Google services have a
            prefix of gcp. For example, gcp-cloud-sql. 3rd
            party services do not. For example,
            test-service-a3dfcx.
        infrastructure (google.events.cloud.networkconnectivity_v1.types.Infrastructure):
            Output only. The type of underlying resources
            used to create the connection.
        psc_config (google.events.cloud.networkconnectivity_v1.types.ServiceConnectionPolicy.PscConfig):
            Configuration used for Private Service
            Connect connections. Used when Infrastructure is
            PSC.
        psc_connections (MutableSequence[google.events.cloud.networkconnectivity_v1.types.ServiceConnectionPolicy.PscConnection]):
            Output only. [Output only] Information about each Private
            Service Connect connection.
    """
    class State(proto.Enum):
        r"""The state of the PSC connection.

        Values:
            STATE_UNSPECIFIED (0):
                An invalid state as the default case.
            ACTIVE (1):
                The connection is fully established and ready
                to use.
            FAILED (2):
                The connection is not functional since some
                resources on the connection fail to be created.
            CREATING (3):
                The connection is being created.
            DELETING (4):
                The connection is being deleted.
        """
        STATE_UNSPECIFIED = 0
        ACTIVE = 1
        FAILED = 2
        CREATING = 3
        DELETING = 4

    class PscConfig(proto.Message):
        r"""Configuration used for Private Service Connect connections.
        Used when Infrastructure is PSC.


        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            subnetworks (MutableSequence[str]):
                The resource paths of subnetworks to use for
                IP address management. Example:

                projects/{projectNumOrId}/regions/{region}/subnetworks/{resourceId}.
            limit (int):
                Optional. Max number of PSC connections for
                this policy.

                This field is a member of `oneof`_ ``_limit``.
        """

        subnetworks: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=1,
        )
        limit: int = proto.Field(
            proto.INT64,
            number=2,
            optional=True,
        )

    class PscConnection(proto.Message):
        r"""Information about a specific Private Service Connect
        connection.

        Attributes:
            state (google.events.cloud.networkconnectivity_v1.types.ServiceConnectionPolicy.State):
                State of the PSC Connection
            consumer_forwarding_rule (str):
                The resource reference of the PSC Forwarding
                Rule within the consumer VPC.
            consumer_address (str):
                The resource reference of the consumer
                address.
            error_type (google.events.cloud.networkconnectivity_v1.types.ConnectionErrorType):
                The error type indicates whether the error is
                consumer facing, producer facing or system
                internal.
            error (google.rpc.status_pb2.Status):
                The most recent error during operating this
                connection.
            gce_operation (str):
                The last Compute Engine operation to setup
                PSC connection.
            consumer_target_project (str):
                The project where the PSC connection is
                created.
            psc_connection_id (str):
                The PSC connection id of the PSC forwarding
                rule.
        """

        state: 'ServiceConnectionPolicy.State' = proto.Field(
            proto.ENUM,
            number=1,
            enum='ServiceConnectionPolicy.State',
        )
        consumer_forwarding_rule: str = proto.Field(
            proto.STRING,
            number=2,
        )
        consumer_address: str = proto.Field(
            proto.STRING,
            number=3,
        )
        error_type: 'ConnectionErrorType' = proto.Field(
            proto.ENUM,
            number=4,
            enum='ConnectionErrorType',
        )
        error: status_pb2.Status = proto.Field(
            proto.MESSAGE,
            number=5,
            message=status_pb2.Status,
        )
        gce_operation: str = proto.Field(
            proto.STRING,
            number=6,
        )
        consumer_target_project: str = proto.Field(
            proto.STRING,
            number=7,
        )
        psc_connection_id: str = proto.Field(
            proto.STRING,
            number=8,
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
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    network: str = proto.Field(
        proto.STRING,
        number=6,
    )
    service_class: str = proto.Field(
        proto.STRING,
        number=7,
    )
    infrastructure: 'Infrastructure' = proto.Field(
        proto.ENUM,
        number=8,
        enum='Infrastructure',
    )
    psc_config: PscConfig = proto.Field(
        proto.MESSAGE,
        number=9,
        message=PscConfig,
    )
    psc_connections: MutableSequence[PscConnection] = proto.RepeatedField(
        proto.MESSAGE,
        number=10,
        message=PscConnection,
    )


class ServiceClass(proto.Message):
    r"""The ServiceClass resource.
    Next id: 8

    Attributes:
        name (str):
            Immutable. The name of a ServiceClass resource. Format:
            projects/{project}/locations/{location}/serviceClasses/{service_class}
            See:
            https://google.aip.dev/122#fields-representing-resource-names
        service_class (str):
            Output only. The generated service class
            name. Use this name to refer to the Service
            class in Service Connection Maps and Service
            Connection Policies.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time when the ServiceClass was
            created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time when the ServiceClass was
            updated.
        labels (MutableMapping[str, str]):
            User-defined labels.
        description (str):
            A description of this resource.
        service_connection_maps (MutableSequence[str]):
            Output only. URIs of all Service Connection
            Maps using this service class.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    service_class: str = proto.Field(
        proto.STRING,
        number=7,
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
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    service_connection_maps: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=6,
    )


class ServiceConnectionToken(proto.Message):
    r"""The ServiceConnectionToken resource.
    Next id: 9

    Attributes:
        name (str):
            Immutable. The name of a ServiceConnectionToken. Format:
            projects/{project}/locations/{location}/ServiceConnectionTokens/{service_connection_token}
            See:
            https://google.aip.dev/122#fields-representing-resource-names
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time when the
            ServiceConnectionToken was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time when the
            ServiceConnectionToken was updated.
        labels (MutableMapping[str, str]):
            User-defined labels.
        description (str):
            A description of this resource.
        network (str):
            The resource path of the network associated
            with this token. Example:

            projects/{projectNumOrId}/global/networks/{resourceId}.
    """

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
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    network: str = proto.Field(
        proto.STRING,
        number=6,
    )


class Hub(proto.Message):
    r"""A Network Connectivity Center hub is a global management
    resource to which you attach spokes. A single hub can contain
    spokes from multiple regions. However, if any of a hub's spokes
    use the site-to-site data transfer feature, the resources
    associated with those spokes must all be in the same VPC
    network. Spokes that do not use site-to-site data transfer can
    be associated with any VPC network in your project.

    Attributes:
        name (str):
            Immutable. The name of the hub. Hub names must be unique.
            They use the following form:
            ``projects/{project_number}/locations/global/hubs/{hub_id}``
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the hub was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the hub was last
            updated.
        labels (MutableMapping[str, str]):
            Optional labels in key:value format. For more information
            about labels, see `Requirements for
            labels <https://cloud.google.com/resource-manager/docs/creating-managing-labels#requirements>`__.
        description (str):
            An optional description of the hub.
        unique_id (str):
            Output only. The Google-generated UUID for the hub. This
            value is unique across all hub resources. If a hub is
            deleted and another with the same name is created, the new
            hub is assigned a different unique_id.
        state (google.events.cloud.networkconnectivity_v1.types.State):
            Output only. The current lifecycle state of
            this hub.
        routing_vpcs (MutableSequence[google.events.cloud.networkconnectivity_v1.types.RoutingVPC]):
            The VPC networks associated with this hub's
            spokes.
            This field is read-only. Network Connectivity
            Center automatically populates it based on the
            set of spokes attached to the hub.
    """

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
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    unique_id: str = proto.Field(
        proto.STRING,
        number=8,
    )
    state: 'State' = proto.Field(
        proto.ENUM,
        number=9,
        enum='State',
    )
    routing_vpcs: MutableSequence['RoutingVPC'] = proto.RepeatedField(
        proto.MESSAGE,
        number=10,
        message='RoutingVPC',
    )


class RoutingVPC(proto.Message):
    r"""RoutingVPC contains information about the VPC networks
    associated with the spokes of a Network Connectivity Center hub.

    Attributes:
        uri (str):
            The URI of the VPC network.
        required_for_new_site_to_site_data_transfer_spokes (bool):
            Output only. If true, indicates that this VPC network is
            currently associated with spokes that use the data transfer
            feature (spokes where the site_to_site_data_transfer field
            is set to true). If you create new spokes that use data
            transfer, they must be associated with this VPC network. At
            most, one VPC network will have this field set to true.
    """

    uri: str = proto.Field(
        proto.STRING,
        number=1,
    )
    required_for_new_site_to_site_data_transfer_spokes: bool = proto.Field(
        proto.BOOL,
        number=2,
    )


class Spoke(proto.Message):
    r"""A Network Connectivity Center spoke represents one or more network
    connectivity resources.

    When you create a spoke, you associate it with a hub. You must also
    identify a value for exactly one of the following fields:

    -  linked_vpn_tunnels
    -  linked_interconnect_attachments
    -  linked_router_appliance_instances

    Attributes:
        name (str):
            Immutable. The name of the spoke. Spoke names must be
            unique. They use the following form:
            ``projects/{project_number}/locations/{region}/spokes/{spoke_id}``
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the spoke was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the spoke was last
            updated.
        labels (MutableMapping[str, str]):
            Optional labels in key:value format. For more information
            about labels, see `Requirements for
            labels <https://cloud.google.com/resource-manager/docs/creating-managing-labels#requirements>`__.
        description (str):
            An optional description of the spoke.
        hub (str):
            Immutable. The name of the hub that this
            spoke is attached to.
        linked_vpn_tunnels (google.events.cloud.networkconnectivity_v1.types.LinkedVpnTunnels):
            VPN tunnels that are associated with the
            spoke.
        linked_interconnect_attachments (google.events.cloud.networkconnectivity_v1.types.LinkedInterconnectAttachments):
            VLAN attachments that are associated with the
            spoke.
        linked_router_appliance_instances (google.events.cloud.networkconnectivity_v1.types.LinkedRouterApplianceInstances):
            Router appliance instances that are
            associated with the spoke.
        unique_id (str):
            Output only. The Google-generated UUID for the spoke. This
            value is unique across all spoke resources. If a spoke is
            deleted and another with the same name is created, the new
            spoke is assigned a different unique_id.
        state (google.events.cloud.networkconnectivity_v1.types.State):
            Output only. The current lifecycle state of
            this spoke.
    """

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
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    hub: str = proto.Field(
        proto.STRING,
        number=6,
    )
    linked_vpn_tunnels: 'LinkedVpnTunnels' = proto.Field(
        proto.MESSAGE,
        number=17,
        message='LinkedVpnTunnels',
    )
    linked_interconnect_attachments: 'LinkedInterconnectAttachments' = proto.Field(
        proto.MESSAGE,
        number=18,
        message='LinkedInterconnectAttachments',
    )
    linked_router_appliance_instances: 'LinkedRouterApplianceInstances' = proto.Field(
        proto.MESSAGE,
        number=19,
        message='LinkedRouterApplianceInstances',
    )
    unique_id: str = proto.Field(
        proto.STRING,
        number=11,
    )
    state: 'State' = proto.Field(
        proto.ENUM,
        number=15,
        enum='State',
    )


class LinkedVpnTunnels(proto.Message):
    r"""A collection of Cloud VPN tunnel resources. These resources
    should be redundant HA VPN tunnels that all advertise the same
    prefixes to Google Cloud. Alternatively, in a passive/active
    configuration, all tunnels should be capable of advertising the
    same prefixes.

    Attributes:
        uris (MutableSequence[str]):
            The URIs of linked VPN tunnel resources.
        site_to_site_data_transfer (bool):
            A value that controls whether site-to-site data transfer is
            enabled for these resources. Data transfer is available only
            in `supported
            locations <https://cloud.google.com/network-connectivity/docs/network-connectivity-center/concepts/locations>`__.
        vpc_network (str):
            Output only. The VPC network where these VPN
            tunnels are located.
    """

    uris: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=1,
    )
    site_to_site_data_transfer: bool = proto.Field(
        proto.BOOL,
        number=2,
    )
    vpc_network: str = proto.Field(
        proto.STRING,
        number=3,
    )


class LinkedInterconnectAttachments(proto.Message):
    r"""A collection of VLAN attachment resources. These resources
    should be redundant attachments that all advertise the same
    prefixes to Google Cloud. Alternatively, in active/passive
    configurations, all attachments should be capable of advertising
    the same prefixes.

    Attributes:
        uris (MutableSequence[str]):
            The URIs of linked interconnect attachment
            resources
        site_to_site_data_transfer (bool):
            A value that controls whether site-to-site data transfer is
            enabled for these resources. Data transfer is available only
            in `supported
            locations <https://cloud.google.com/network-connectivity/docs/network-connectivity-center/concepts/locations>`__.
        vpc_network (str):
            Output only. The VPC network where these VLAN
            attachments are located.
    """

    uris: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=1,
    )
    site_to_site_data_transfer: bool = proto.Field(
        proto.BOOL,
        number=2,
    )
    vpc_network: str = proto.Field(
        proto.STRING,
        number=3,
    )


class LinkedRouterApplianceInstances(proto.Message):
    r"""A collection of router appliance instances. If you configure
    multiple router appliance instances to receive data from the
    same set of sites outside of Google Cloud, we recommend that you
    associate those instances with the same spoke.

    Attributes:
        instances (MutableSequence[google.events.cloud.networkconnectivity_v1.types.RouterApplianceInstance]):
            The list of router appliance instances.
        site_to_site_data_transfer (bool):
            A value that controls whether site-to-site data transfer is
            enabled for these resources. Data transfer is available only
            in `supported
            locations <https://cloud.google.com/network-connectivity/docs/network-connectivity-center/concepts/locations>`__.
        vpc_network (str):
            Output only. The VPC network where these
            router appliance instances are located.
    """

    instances: MutableSequence['RouterApplianceInstance'] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message='RouterApplianceInstance',
    )
    site_to_site_data_transfer: bool = proto.Field(
        proto.BOOL,
        number=2,
    )
    vpc_network: str = proto.Field(
        proto.STRING,
        number=3,
    )


class RouterApplianceInstance(proto.Message):
    r"""A router appliance instance is a Compute Engine virtual
    machine (VM) instance that acts as a BGP speaker. A router
    appliance instance is specified by the URI of the VM and the
    internal IP address of one of the VM's network interfaces.

    Attributes:
        virtual_machine (str):
            The URI of the VM.
        ip_address (str):
            The IP address on the VM to use for peering.
    """

    virtual_machine: str = proto.Field(
        proto.STRING,
        number=1,
    )
    ip_address: str = proto.Field(
        proto.STRING,
        number=3,
    )


class ServiceClassEventData(proto.Message):
    r"""The data within all ServiceClass events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.networkconnectivity_v1.types.ServiceClass):
            Optional. The ServiceClass event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'ServiceClass' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='ServiceClass',
    )


class ServiceConnectionTokenEventData(proto.Message):
    r"""The data within all ServiceConnectionToken events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.networkconnectivity_v1.types.ServiceConnectionToken):
            Optional. The ServiceConnectionToken event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'ServiceConnectionToken' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='ServiceConnectionToken',
    )


class ServiceConnectionMapEventData(proto.Message):
    r"""The data within all ServiceConnectionMap events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.networkconnectivity_v1.types.ServiceConnectionMap):
            Optional. The ServiceConnectionMap event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'ServiceConnectionMap' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='ServiceConnectionMap',
    )


class HubEventData(proto.Message):
    r"""The data within all Hub events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.networkconnectivity_v1.types.Hub):
            Optional. The Hub event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Hub' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Hub',
    )


class SpokeEventData(proto.Message):
    r"""The data within all Spoke events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.networkconnectivity_v1.types.Spoke):
            Optional. The Spoke event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Spoke' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Spoke',
    )


class ServiceConnectionPolicyEventData(proto.Message):
    r"""The data within all ServiceConnectionPolicy events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.networkconnectivity_v1.types.ServiceConnectionPolicy):
            Optional. The ServiceConnectionPolicy event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'ServiceConnectionPolicy' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='ServiceConnectionPolicy',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
