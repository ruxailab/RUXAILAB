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
from google.events.cloud.iot import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.iot_v1.types.data import Device
from google.events.cloud.iot_v1.types.data import DeviceConfig
from google.events.cloud.iot_v1.types.data import DeviceCredential
from google.events.cloud.iot_v1.types.data import DeviceEventData
from google.events.cloud.iot_v1.types.data import DeviceRegistry
from google.events.cloud.iot_v1.types.data import DeviceState
from google.events.cloud.iot_v1.types.data import EventNotificationConfig
from google.events.cloud.iot_v1.types.data import GatewayConfig
from google.events.cloud.iot_v1.types.data import HttpConfig
from google.events.cloud.iot_v1.types.data import MqttConfig
from google.events.cloud.iot_v1.types.data import PublicKeyCertificate
from google.events.cloud.iot_v1.types.data import PublicKeyCredential
from google.events.cloud.iot_v1.types.data import RegistryCredential
from google.events.cloud.iot_v1.types.data import RegistryEventData
from google.events.cloud.iot_v1.types.data import StateNotificationConfig
from google.events.cloud.iot_v1.types.data import X509CertificateDetails
from google.events.cloud.iot_v1.types.data import GatewayAuthMethod
from google.events.cloud.iot_v1.types.data import GatewayType
from google.events.cloud.iot_v1.types.data import HttpState
from google.events.cloud.iot_v1.types.data import LogLevel
from google.events.cloud.iot_v1.types.data import MqttState
from google.events.cloud.iot_v1.types.data import PublicKeyCertificateFormat
from google.events.cloud.iot_v1.types.data import PublicKeyFormat

__all__ = ('Device',
    'DeviceConfig',
    'DeviceCredential',
    'DeviceEventData',
    'DeviceRegistry',
    'DeviceState',
    'EventNotificationConfig',
    'GatewayConfig',
    'HttpConfig',
    'MqttConfig',
    'PublicKeyCertificate',
    'PublicKeyCredential',
    'RegistryCredential',
    'RegistryEventData',
    'StateNotificationConfig',
    'X509CertificateDetails',
    'GatewayAuthMethod',
    'GatewayType',
    'HttpState',
    'LogLevel',
    'MqttState',
    'PublicKeyCertificateFormat',
    'PublicKeyFormat',
)
