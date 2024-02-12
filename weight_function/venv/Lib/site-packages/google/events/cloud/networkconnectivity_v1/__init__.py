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
from google.events.cloud.networkconnectivity_v1 import gapic_version as package_version

__version__ = package_version.__version__



from .types.data import Hub
from .types.data import HubEventData
from .types.data import LinkedInterconnectAttachments
from .types.data import LinkedRouterApplianceInstances
from .types.data import LinkedVpnTunnels
from .types.data import RouterApplianceInstance
from .types.data import RoutingVPC
from .types.data import ServiceClass
from .types.data import ServiceClassEventData
from .types.data import ServiceConnectionMap
from .types.data import ServiceConnectionMapEventData
from .types.data import ServiceConnectionPolicy
from .types.data import ServiceConnectionPolicyEventData
from .types.data import ServiceConnectionToken
from .types.data import ServiceConnectionTokenEventData
from .types.data import Spoke
from .types.data import SpokeEventData
from .types.data import ConnectionErrorType
from .types.data import Infrastructure
from .types.data import State

__all__ = (
'ConnectionErrorType',
'Hub',
'HubEventData',
'Infrastructure',
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
'State',
)
