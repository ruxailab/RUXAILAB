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
from google.events.cloud.vmmigration_v1 import gapic_version as package_version

__version__ = package_version.__version__



from .types.data import AdaptingOSStep
from .types.data import ApplianceVersion
from .types.data import AppliedLicense
from .types.data import AvailableUpdates
from .types.data import AwsSourceDetails
from .types.data import AwsSourceVmDetails
from .types.data import CloneJob
from .types.data import CloneJobEventData
from .types.data import CloneStep
from .types.data import ComputeEngineTargetDefaults
from .types.data import ComputeEngineTargetDetails
from .types.data import ComputeScheduling
from .types.data import CutoverForecast
from .types.data import CutoverJob
from .types.data import CutoverJobEventData
from .types.data import CutoverStep
from .types.data import CycleStep
from .types.data import DatacenterConnector
from .types.data import DatacenterConnectorEventData
from .types.data import Group
from .types.data import GroupEventData
from .types.data import InitializingReplicationStep
from .types.data import InstantiatingMigratedVMStep
from .types.data import MigratingVm
from .types.data import MigratingVmEventData
from .types.data import MigrationWarning
from .types.data import NetworkInterface
from .types.data import PostProcessingStep
from .types.data import PreparingVMDisksStep
from .types.data import ReplicatingStep
from .types.data import ReplicationCycle
from .types.data import ReplicationSync
from .types.data import SchedulePolicy
from .types.data import SchedulingNodeAffinity
from .types.data import ShuttingDownSourceVMStep
from .types.data import Source
from .types.data import SourceEventData
from .types.data import TargetProject
from .types.data import TargetProjectEventData
from .types.data import UpgradeStatus
from .types.data import UtilizationReport
from .types.data import UtilizationReportEventData
from .types.data import VmUtilizationInfo
from .types.data import VmUtilizationMetrics
from .types.data import VmwareSourceDetails
from .types.data import VmwareVmDetails
from .types.data import ComputeEngineBootOption
from .types.data import ComputeEngineDiskType
from .types.data import ComputeEngineLicenseType

__all__ = (
'AdaptingOSStep',
'ApplianceVersion',
'AppliedLicense',
'AvailableUpdates',
'AwsSourceDetails',
'AwsSourceVmDetails',
'CloneJob',
'CloneJobEventData',
'CloneStep',
'ComputeEngineBootOption',
'ComputeEngineDiskType',
'ComputeEngineLicenseType',
'ComputeEngineTargetDefaults',
'ComputeEngineTargetDetails',
'ComputeScheduling',
'CutoverForecast',
'CutoverJob',
'CutoverJobEventData',
'CutoverStep',
'CycleStep',
'DatacenterConnector',
'DatacenterConnectorEventData',
'Group',
'GroupEventData',
'InitializingReplicationStep',
'InstantiatingMigratedVMStep',
'MigratingVm',
'MigratingVmEventData',
'MigrationWarning',
'NetworkInterface',
'PostProcessingStep',
'PreparingVMDisksStep',
'ReplicatingStep',
'ReplicationCycle',
'ReplicationSync',
'SchedulePolicy',
'SchedulingNodeAffinity',
'ShuttingDownSourceVMStep',
'Source',
'SourceEventData',
'TargetProject',
'TargetProjectEventData',
'UpgradeStatus',
'UtilizationReport',
'UtilizationReportEventData',
'VmUtilizationInfo',
'VmUtilizationMetrics',
'VmwareSourceDetails',
'VmwareVmDetails',
)
