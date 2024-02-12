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
from google.events.cloud.clouddms import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.clouddms_v1.types.data import AlloyDbConnectionProfile
from google.events.cloud.clouddms_v1.types.data import AlloyDbSettings
from google.events.cloud.clouddms_v1.types.data import CloudSqlConnectionProfile
from google.events.cloud.clouddms_v1.types.data import CloudSqlSettings
from google.events.cloud.clouddms_v1.types.data import ConnectionProfile
from google.events.cloud.clouddms_v1.types.data import ConnectionProfileEventData
from google.events.cloud.clouddms_v1.types.data import DatabaseType
from google.events.cloud.clouddms_v1.types.data import MigrationJob
from google.events.cloud.clouddms_v1.types.data import MigrationJobEventData
from google.events.cloud.clouddms_v1.types.data import MySqlConnectionProfile
from google.events.cloud.clouddms_v1.types.data import PostgreSqlConnectionProfile
from google.events.cloud.clouddms_v1.types.data import ReverseSshConnectivity
from google.events.cloud.clouddms_v1.types.data import SqlAclEntry
from google.events.cloud.clouddms_v1.types.data import SqlIpConfig
from google.events.cloud.clouddms_v1.types.data import SslConfig
from google.events.cloud.clouddms_v1.types.data import StaticIpConnectivity
from google.events.cloud.clouddms_v1.types.data import VpcPeeringConnectivity
from google.events.cloud.clouddms_v1.types.data import DatabaseEngine
from google.events.cloud.clouddms_v1.types.data import DatabaseProvider
from google.events.cloud.clouddms_v1.types.data import NetworkArchitecture

__all__ = ('AlloyDbConnectionProfile',
    'AlloyDbSettings',
    'CloudSqlConnectionProfile',
    'CloudSqlSettings',
    'ConnectionProfile',
    'ConnectionProfileEventData',
    'DatabaseType',
    'MigrationJob',
    'MigrationJobEventData',
    'MySqlConnectionProfile',
    'PostgreSqlConnectionProfile',
    'ReverseSshConnectivity',
    'SqlAclEntry',
    'SqlIpConfig',
    'SslConfig',
    'StaticIpConnectivity',
    'VpcPeeringConnectivity',
    'DatabaseEngine',
    'DatabaseProvider',
    'NetworkArchitecture',
)
