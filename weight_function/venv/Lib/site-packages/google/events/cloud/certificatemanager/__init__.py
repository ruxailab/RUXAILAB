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
from google.events.cloud.certificatemanager import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.certificatemanager_v1.types.data import Certificate
from google.events.cloud.certificatemanager_v1.types.data import CertificateEventData
from google.events.cloud.certificatemanager_v1.types.data import CertificateIssuanceConfig
from google.events.cloud.certificatemanager_v1.types.data import CertificateIssuanceConfigEventData
from google.events.cloud.certificatemanager_v1.types.data import CertificateMap
from google.events.cloud.certificatemanager_v1.types.data import CertificateMapEntry
from google.events.cloud.certificatemanager_v1.types.data import CertificateMapEntryEventData
from google.events.cloud.certificatemanager_v1.types.data import CertificateMapEventData
from google.events.cloud.certificatemanager_v1.types.data import DnsAuthorization
from google.events.cloud.certificatemanager_v1.types.data import DnsAuthorizationEventData
from google.events.cloud.certificatemanager_v1.types.data import ServingState

__all__ = ('Certificate',
    'CertificateEventData',
    'CertificateIssuanceConfig',
    'CertificateIssuanceConfigEventData',
    'CertificateMap',
    'CertificateMapEntry',
    'CertificateMapEntryEventData',
    'CertificateMapEventData',
    'DnsAuthorization',
    'DnsAuthorizationEventData',
    'ServingState',
)
