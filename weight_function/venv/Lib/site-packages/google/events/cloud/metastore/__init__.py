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
from google.events.cloud.metastore import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.metastore_v1.types.data import AuxiliaryVersionConfig
from google.events.cloud.metastore_v1.types.data import BackendMetastore
from google.events.cloud.metastore_v1.types.data import Backup
from google.events.cloud.metastore_v1.types.data import BackupEventData
from google.events.cloud.metastore_v1.types.data import DatabaseDumpSpec
from google.events.cloud.metastore_v1.types.data import EncryptionConfig
from google.events.cloud.metastore_v1.types.data import Federation
from google.events.cloud.metastore_v1.types.data import FederationEventData
from google.events.cloud.metastore_v1.types.data import HiveMetastoreConfig
from google.events.cloud.metastore_v1.types.data import KerberosConfig
from google.events.cloud.metastore_v1.types.data import MaintenanceWindow
from google.events.cloud.metastore_v1.types.data import MetadataExport
from google.events.cloud.metastore_v1.types.data import MetadataImport
from google.events.cloud.metastore_v1.types.data import MetadataImportEventData
from google.events.cloud.metastore_v1.types.data import MetadataManagementActivity
from google.events.cloud.metastore_v1.types.data import NetworkConfig
from google.events.cloud.metastore_v1.types.data import Restore
from google.events.cloud.metastore_v1.types.data import ScalingConfig
from google.events.cloud.metastore_v1.types.data import Secret
from google.events.cloud.metastore_v1.types.data import Service
from google.events.cloud.metastore_v1.types.data import ServiceEventData
from google.events.cloud.metastore_v1.types.data import TelemetryConfig

__all__ = ('AuxiliaryVersionConfig',
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
