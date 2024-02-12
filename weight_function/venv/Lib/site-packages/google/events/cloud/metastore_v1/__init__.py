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
from google.events.cloud.metastore_v1 import gapic_version as package_version

__version__ = package_version.__version__



from .types.data import AuxiliaryVersionConfig
from .types.data import BackendMetastore
from .types.data import Backup
from .types.data import BackupEventData
from .types.data import DatabaseDumpSpec
from .types.data import EncryptionConfig
from .types.data import Federation
from .types.data import FederationEventData
from .types.data import HiveMetastoreConfig
from .types.data import KerberosConfig
from .types.data import MaintenanceWindow
from .types.data import MetadataExport
from .types.data import MetadataImport
from .types.data import MetadataImportEventData
from .types.data import MetadataManagementActivity
from .types.data import NetworkConfig
from .types.data import Restore
from .types.data import ScalingConfig
from .types.data import Secret
from .types.data import Service
from .types.data import ServiceEventData
from .types.data import TelemetryConfig

__all__ = (
'AuxiliaryVersionConfig',
'BackendMetastore',
'Backup',
'BackupEventData',
'DatabaseDumpSpec',
'EncryptionConfig',
'Federation',
'FederationEventData',
'HiveMetastoreConfig',
'KerberosConfig',
'MaintenanceWindow',
'MetadataExport',
'MetadataImport',
'MetadataImportEventData',
'MetadataManagementActivity',
'NetworkConfig',
'Restore',
'ScalingConfig',
'Secret',
'Service',
'ServiceEventData',
'TelemetryConfig',
)
