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
from google.events.cloud.networkconnectivity import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.networkconnectivity_v1.types.data import Hub
from google.events.cloud.networkconnectivity_v1.types.data import HubEventData
from google.events.cloud.networkconnectivity_v1.types.data import LinkedInterconnectAttachments
from google.events.cloud.networkconnectivity_v1.types.data import LinkedRouterApplianceInstances
from google.events.cloud.networkconnectivity_v1.types.data import LinkedVpnTunnels
from google.events.cloud.networkconnectivity_v1.types.data import RouterApplianceInstance
from google.events.cloud.networkconnectivity_v1.types.data import RoutingVPC
from google.events.cloud.networkconnectivity_v1.types.data import ServiceClass
from google.events.cloud.networkconnectivity_v1.types.data import ServiceClassEventData
from google.events.cloud.networkconnectivity_v1.types.data import ServiceConnectionMap
from google.events.cloud.networkconnectivity_v1.types.data import ServiceConnectionMapEventData
from google.events.cloud.networkconnectivity_v1.types.data import ServiceConnectionPolicy
from google.events.cloud.networkconnectivity_v1.types.data import ServiceConnectionPolicyEventData
from google.events.cloud.networkconnectivity_v1.types.data import ServiceConnectionToken
from google.events.cloud.networkconnectivity_v1.types.data import ServiceConnectionTokenEventData
from google.events.cloud.networkconnectivity_v1.types.data import Spoke
from google.events.cloud.networkconnectivity_v1.types.data import SpokeEventData
from google.events.cloud.networkconnectivity_v1.types.data import ConnectionErrorType
from google.events.cloud.networkconnectivity_v1.types.data import Infrastructure
from google.events.cloud.networkconnectivity_v1.types.data import State

__all__ = ('Hub',
    'HubEventData',
    'LinkedInterconnectAttachments',
    'LinkedRouterApplianceInstances',
    'LinkedVpnTunnels',
    'RouterApplianceInstance',
    'RoutingVPC',
    'ServiceClass',
    'ServiceClassEventData',
    'ServiceConnectionMap',
    'ServiceConnectionMapEventData',
    'ServiceConnectionPolicy',
    'ServiceConnectionPolicyEventData',
    'ServiceConnectionToken',
    'ServiceConnectionTokenEventData',
    'Spoke',
    'SpokeEventData',
    'ConnectionErrorType',
    'Infrastructure',
    'State',
)
