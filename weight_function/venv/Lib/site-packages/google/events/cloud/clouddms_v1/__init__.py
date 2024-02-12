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
from google.events.cloud.clouddms_v1 import gapic_version as package_version

__version__ = package_version.__version__



from .types.data import AlloyDbConnectionProfile
from .types.data import AlloyDbSettings
from .types.data import CloudSqlConnectionProfile
from .types.data import CloudSqlSettings
from .types.data import ConnectionProfile
from .types.data import ConnectionProfileEventData
from .types.data import DatabaseType
from .types.data import MigrationJob
from .types.data import MigrationJobEventData
from .types.data import MySqlConnectionProfile
from .types.data import PostgreSqlConnectionProfile
from .types.data import ReverseSshConnectivity
from .types.data import SqlAclEntry
from .types.data import SqlIpConfig
from .types.data import SslConfig
from .types.data import StaticIpConnectivity
from .types.data import VpcPeeringConnectivity
from .types.data import DatabaseEngine
from .types.data import DatabaseProvider
from .types.data import NetworkArchitecture

__all__ = (
'AlloyDbConnectionProfile',
'AlloyDbSettings',
'CloudSqlConnectionProfile',
'CloudSqlSettings',
'ConnectionProfile',
'ConnectionProfileEventData',
'DatabaseEngine',
'DatabaseProvider',
'DatabaseType',
'MigrationJob',
'MigrationJobEventData',
'MySqlConnectionProfile',
'NetworkArchitecture',
'PostgreSqlConnectionProfile',
'ReverseSshConnectivity',
'SqlAclEntry',
'SqlIpConfig',
'SslConfig',
'StaticIpConnectivity',
'VpcPeeringConnectivity',
)
