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
    package='google.events.cloud.beyondcorp.clientconnectorservices.v1',
    manifest={
        'ClientConnectorService',
        'ClientConnectorServiceEventData',
    },
)


class ClientConnectorService(proto.Message):
    r"""Message describing ClientConnectorService object.

    Attributes:
        name (str):
            Required. Name of resource. The name is
            ignored during creation.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. [Output only] Create time stamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. [Output only] Update time stamp.
        display_name (str):
            Optional. User-provided name. The display name should follow
            certain format.

            -  Must be 6 to 30 characters in length.
            -  Can only contain lowercase letters, numbers, and hyphens.
            -  Must start with a letter.
        ingress (google.events.cloud.beyondcorp.clientconnectorservices_v1.types.ClientConnectorService.Ingress):
            Required. The details of the ingress
            settings.
        egress (google.events.cloud.beyondcorp.clientconnectorservices_v1.types.ClientConnectorService.Egress):
            Required. The details of the egress settings.
        state (google.events.cloud.beyondcorp.clientconnectorservices_v1.types.ClientConnectorService.State):
            Output only. The operational state of the
            ClientConnectorService.
    """
    class State(proto.Enum):
        r"""Represents the different states of a ClientConnectorService.

        Values:
            STATE_UNSPECIFIED (0):
                Default value. This value is unused.
            CREATING (1):
                ClientConnectorService is being created.
            UPDATING (2):
                ClientConnectorService is being updated.
            DELETING (3):
                ClientConnectorService is being deleted.
            RUNNING (4):
                ClientConnectorService is running.
            DOWN (5):
                ClientConnectorService is down and may be
                restored in the future. This happens when CCFE
                sends ProjectState = OFF.
            ERROR (6):
                ClientConnectorService encountered an error
                and is in an indeterministic state.
        """
        STATE_UNSPECIFIED = 0
        CREATING = 1
        UPDATING = 2
        DELETING = 3
        RUNNING = 4
        DOWN = 5
        ERROR = 6

    class Ingress(proto.Message):
        r"""Settings of how to connect to the ClientGateway.
        One of the following options should be set.


        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            config (google.events.cloud.beyondcorp.clientconnectorservices_v1.types.ClientConnectorService.Ingress.Config):
                The basic ingress config for ClientGateways.

                This field is a member of `oneof`_ ``ingress_config``.
        """

        class Config(proto.Message):
            r"""The basic ingress config for ClientGateways.

            Attributes:
                transport_protocol (google.events.cloud.beyondcorp.clientconnectorservices_v1.types.ClientConnectorService.Ingress.Config.TransportProtocol):
                    Required. Immutable. The transport protocol
                    used between the client and the server.
                destination_routes (MutableSequence[google.events.cloud.beyondcorp.clientconnectorservices_v1.types.ClientConnectorService.Ingress.Config.DestinationRoute]):
                    Required. The settings used to configure
                    basic ClientGateways.
            """
            class TransportProtocol(proto.Enum):
                r"""The protocol used to connect to the server.

                Values:
                    TRANSPORT_PROTOCOL_UNSPECIFIED (0):
                        Default value. This value is unused.
                    TCP (1):
                        TCP protocol.
                """
                TRANSPORT_PROTOCOL_UNSPECIFIED = 0
                TCP = 1

            class DestinationRoute(proto.Message):
                r"""The setting used to configure ClientGateways.
                It is adding routes to the client's routing table
                after the connection is established.

                Attributes:
                    address (str):
                        Required. The network address of the subnet
                        for which the packet is routed to the
                        ClientGateway.
                    netmask (str):
                        Required. The network mask of the subnet
                        for which the packet is routed to the
                        ClientGateway.
                """

                address: str = proto.Field(
                    proto.STRING,
                    number=1,
                )
                netmask: str = proto.Field(
                    proto.STRING,
                    number=2,
                )

            transport_protocol: 'ClientConnectorService.Ingress.Config.TransportProtocol' = proto.Field(
                proto.ENUM,
                number=1,
                enum='ClientConnectorService.Ingress.Config.TransportProtocol',
            )
            destination_routes: MutableSequence['ClientConnectorService.Ingress.Config.DestinationRoute'] = proto.RepeatedField(
                proto.MESSAGE,
                number=2,
                message='ClientConnectorService.Ingress.Config.DestinationRoute',
            )

        config: 'ClientConnectorService.Ingress.Config' = proto.Field(
            proto.MESSAGE,
            number=1,
            oneof='ingress_config',
            message='ClientConnectorService.Ingress.Config',
        )

    class Egress(proto.Message):
        r"""The details of the egress info. One of the following options
        should be set.


        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            peered_vpc (google.events.cloud.beyondcorp.clientconnectorservices_v1.types.ClientConnectorService.Egress.PeeredVpc):
                A VPC from the consumer project.

                This field is a member of `oneof`_ ``destination_type``.
        """

        class PeeredVpc(proto.Message):
            r"""The peered VPC owned by the consumer project.

            Attributes:
                network_vpc (str):
                    Required. The name of the peered VPC owned by
                    the consumer project.
            """

            network_vpc: str = proto.Field(
                proto.STRING,
                number=1,
            )

        peered_vpc: 'ClientConnectorService.Egress.PeeredVpc' = proto.Field(
            proto.MESSAGE,
            number=1,
            oneof='destination_type',
            message='ClientConnectorService.Egress.PeeredVpc',
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
    display_name: str = proto.Field(
        proto.STRING,
        number=4,
    )
    ingress: Ingress = proto.Field(
        proto.MESSAGE,
        number=6,
        message=Ingress,
    )
    egress: Egress = proto.Field(
        proto.MESSAGE,
        number=7,
        message=Egress,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=8,
        enum=State,
    )


class ClientConnectorServiceEventData(proto.Message):
    r"""The data within all ClientConnectorService events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.beyondcorp.clientconnectorservices_v1.types.ClientConnectorService):
            Optional. The ClientConnectorService event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'ClientConnectorService' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='ClientConnectorService',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
