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
from google.events.cloud.vmmigration import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.vmmigration_v1.types.data import AdaptingOSStep
from google.events.cloud.vmmigration_v1.types.data import ApplianceVersion
from google.events.cloud.vmmigration_v1.types.data import AppliedLicense
from google.events.cloud.vmmigration_v1.types.data import AvailableUpdates
from google.events.cloud.vmmigration_v1.types.data import AwsSourceDetails
from google.events.cloud.vmmigration_v1.types.data import AwsSourceVmDetails
from google.events.cloud.vmmigration_v1.types.data import CloneJob
from google.events.cloud.vmmigration_v1.types.data import CloneJobEventData
from google.events.cloud.vmmigration_v1.types.data import CloneStep
from google.events.cloud.vmmigration_v1.types.data import ComputeEngineTargetDefaults
from google.events.cloud.vmmigration_v1.types.data import ComputeEngineTargetDetails
from google.events.cloud.vmmigration_v1.types.data import ComputeScheduling
from google.events.cloud.vmmigration_v1.types.data import CutoverForecast
from google.events.cloud.vmmigration_v1.types.data import CutoverJob
from google.events.cloud.vmmigration_v1.types.data import CutoverJobEventData
from google.events.cloud.vmmigration_v1.types.data import CutoverStep
from google.events.cloud.vmmigration_v1.types.data import CycleStep
from google.events.cloud.vmmigration_v1.types.data import DatacenterConnector
from google.events.cloud.vmmigration_v1.types.data import DatacenterConnectorEventData
from google.events.cloud.vmmigration_v1.types.data import Group
from google.events.cloud.vmmigration_v1.types.data import GroupEventData
from google.events.cloud.vmmigration_v1.types.data import InitializingReplicationStep
from google.events.cloud.vmmigration_v1.types.data import InstantiatingMigratedVMStep
from google.events.cloud.vmmigration_v1.types.data import MigratingVm
from google.events.cloud.vmmigration_v1.types.data import MigratingVmEventData
from google.events.cloud.vmmigration_v1.types.data import MigrationWarning
from google.events.cloud.vmmigration_v1.types.data import NetworkInterface
from google.events.cloud.vmmigration_v1.types.data import PostProcessingStep
from google.events.cloud.vmmigration_v1.types.data import PreparingVMDisksStep
from google.events.cloud.vmmigration_v1.types.data import ReplicatingStep
from google.events.cloud.vmmigration_v1.types.data import ReplicationCycle
from google.events.cloud.vmmigration_v1.types.data import ReplicationSync
from google.events.cloud.vmmigration_v1.types.data import SchedulePolicy
from google.events.cloud.vmmigration_v1.types.data import SchedulingNodeAffinity
from google.events.cloud.vmmigration_v1.types.data import ShuttingDownSourceVMStep
from google.events.cloud.vmmigration_v1.types.data import Source
from google.events.cloud.vmmigration_v1.types.data import SourceEventData
from google.events.cloud.vmmigration_v1.types.data import TargetProject
from google.events.cloud.vmmigration_v1.types.data import TargetProjectEventData
from google.events.cloud.vmmigration_v1.types.data import UpgradeStatus
from google.events.cloud.vmmigration_v1.types.data import UtilizationReport
from google.events.cloud.vmmigration_v1.types.data import UtilizationReportEventData
from google.events.cloud.vmmigration_v1.types.data import VmUtilizationInfo
from google.events.cloud.vmmigration_v1.types.data import VmUtilizationMetrics
from google.events.cloud.vmmigration_v1.types.data import VmwareSourceDetails
from google.events.cloud.vmmigration_v1.types.data import VmwareVmDetails
from google.events.cloud.vmmigration_v1.types.data import ComputeEngineBootOption
from google.events.cloud.vmmigration_v1.types.data import ComputeEngineDiskType
from google.events.cloud.vmmigration_v1.types.data import ComputeEngineLicenseType

__all__ = ('AdaptingOSStep',
    'ApplianceVersion',
    'AppliedLicense',
    'AvailableUpdates',
    'AwsSourceDetails',
    'AwsSourceVmDetails',
    'CloneJob',
    'CloneJobEventData',
    'CloneStep',
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
    'ComputeEngineBootOption',
    'ComputeEngineDiskType',
    'ComputeEngineLicenseType',
)
