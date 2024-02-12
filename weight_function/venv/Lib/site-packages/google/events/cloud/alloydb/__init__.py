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
from google.events.cloud.alloydb import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.alloydb_v1.types.data import AutomatedBackupPolicy
from google.events.cloud.alloydb_v1.types.data import Backup
from google.events.cloud.alloydb_v1.types.data import BackupEventData
from google.events.cloud.alloydb_v1.types.data import BackupSource
from google.events.cloud.alloydb_v1.types.data import Cluster
from google.events.cloud.alloydb_v1.types.data import ClusterEventData
from google.events.cloud.alloydb_v1.types.data import EncryptionConfig
from google.events.cloud.alloydb_v1.types.data import EncryptionInfo
from google.events.cloud.alloydb_v1.types.data import Instance
from google.events.cloud.alloydb_v1.types.data import InstanceEventData
from google.events.cloud.alloydb_v1.types.data import MigrationSource
from google.events.cloud.alloydb_v1.types.data import SslConfig
from google.events.cloud.alloydb_v1.types.data import UserPassword
from google.events.cloud.alloydb_v1.types.data import DatabaseVersion

__all__ = ('AutomatedBackupPolicy',
    'Backup',
    'BackupEventData',
    'BackupSource',
    'Cluster',
    'ClusterEventData',
    'EncryptionConfig',
    'EncryptionInfo',
    'Instance',
    'InstanceEventData',
    'MigrationSource',
    'SslConfig',
    'UserPassword',
    'DatabaseVersion',
)
