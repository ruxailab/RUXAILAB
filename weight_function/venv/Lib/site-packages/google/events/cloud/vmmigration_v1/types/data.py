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
from __future__ import annotations

from typing import MutableMapping, MutableSequence

import proto  # type: ignore

from google.protobuf import duration_pb2  # type: ignore
from google.protobuf import timestamp_pb2  # type: ignore
from google.rpc import error_details_pb2  # type: ignore
from google.rpc import status_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.vmmigration.v1',
    manifest={
        'ComputeEngineDiskType',
        'ComputeEngineLicenseType',
        'ComputeEngineBootOption',
        'ReplicationCycle',
        'CycleStep',
        'InitializingReplicationStep',
        'ReplicatingStep',
        'PostProcessingStep',
        'ReplicationSync',
        'MigratingVm',
        'CutoverForecast',
        'CloneJob',
        'CloneStep',
        'AdaptingOSStep',
        'PreparingVMDisksStep',
        'InstantiatingMigratedVMStep',
        'CutoverJob',
        'CutoverStep',
        'ShuttingDownSourceVMStep',
        'Source',
        'VmwareSourceDetails',
        'AwsSourceDetails',
        'DatacenterConnector',
        'UpgradeStatus',
        'AvailableUpdates',
        'ApplianceVersion',
        'VmwareVmDetails',
        'UtilizationReport',
        'VmUtilizationInfo',
        'VmUtilizationMetrics',
        'ComputeEngineTargetDefaults',
        'ComputeEngineTargetDetails',
        'NetworkInterface',
        'AppliedLicense',
        'SchedulingNodeAffinity',
        'ComputeScheduling',
        'SchedulePolicy',
        'TargetProject',
        'Group',
        'MigrationWarning',
        'AwsSourceVmDetails',
        'UtilizationReportEventData',
        'GroupEventData',
        'CloneJobEventData',
        'DatacenterConnectorEventData',
        'TargetProjectEventData',
        'CutoverJobEventData',
        'SourceEventData',
        'MigratingVmEventData',
    },
)


class ComputeEngineDiskType(proto.Enum):
    r"""Types of disks supported for Compute Engine VM.

    Values:
        COMPUTE_ENGINE_DISK_TYPE_UNSPECIFIED (0):
            An unspecified disk type. Will be used as
            STANDARD.
        COMPUTE_ENGINE_DISK_TYPE_STANDARD (1):
            A Standard disk type.
        COMPUTE_ENGINE_DISK_TYPE_SSD (2):
            SSD hard disk type.
        COMPUTE_ENGINE_DISK_TYPE_BALANCED (3):
            An alternative to SSD persistent disks that
            balance performance and cost.
    """
    COMPUTE_ENGINE_DISK_TYPE_UNSPECIFIED = 0
    COMPUTE_ENGINE_DISK_TYPE_STANDARD = 1
    COMPUTE_ENGINE_DISK_TYPE_SSD = 2
    COMPUTE_ENGINE_DISK_TYPE_BALANCED = 3


class ComputeEngineLicenseType(proto.Enum):
    r"""Types of licenses used in OS adaptation.

    Values:
        COMPUTE_ENGINE_LICENSE_TYPE_DEFAULT (0):
            The license type is the default for the OS.
        COMPUTE_ENGINE_LICENSE_TYPE_PAYG (1):
            The license type is Pay As You Go license
            type.
        COMPUTE_ENGINE_LICENSE_TYPE_BYOL (2):
            The license type is Bring Your Own License
            type.
    """
    COMPUTE_ENGINE_LICENSE_TYPE_DEFAULT = 0
    COMPUTE_ENGINE_LICENSE_TYPE_PAYG = 1
    COMPUTE_ENGINE_LICENSE_TYPE_BYOL = 2


class ComputeEngineBootOption(proto.Enum):
    r"""Possible values for vm boot option.

    Values:
        COMPUTE_ENGINE_BOOT_OPTION_UNSPECIFIED (0):
            The boot option is unknown.
        COMPUTE_ENGINE_BOOT_OPTION_EFI (1):
            The boot option is EFI.
        COMPUTE_ENGINE_BOOT_OPTION_BIOS (2):
            The boot option is BIOS.
    """
    COMPUTE_ENGINE_BOOT_OPTION_UNSPECIFIED = 0
    COMPUTE_ENGINE_BOOT_OPTION_EFI = 1
    COMPUTE_ENGINE_BOOT_OPTION_BIOS = 2


class ReplicationCycle(proto.Message):
    r"""ReplicationCycle contains information about the current
    replication cycle status.

    Attributes:
        name (str):
            The identifier of the ReplicationCycle.
        cycle_number (int):
            The cycle's ordinal number.
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the replication cycle has started.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the replication cycle has ended.
        total_pause_duration (google.protobuf.duration_pb2.Duration):
            The accumulated duration the replication
            cycle was paused.
        progress_percent (int):
            The current progress in percentage of this
            cycle. Was replaced by 'steps' field, which
            breaks down the cycle progression more
            accurately.
        steps (MutableSequence[google.events.cloud.vmmigration_v1.types.CycleStep]):
            The cycle's steps list representing its
            progress.
        state (google.events.cloud.vmmigration_v1.types.ReplicationCycle.State):
            State of the ReplicationCycle.
        error (google.rpc.status_pb2.Status):
            Provides details on the state of the cycle in
            case of an error.
        warnings (MutableSequence[google.events.cloud.vmmigration_v1.types.MigrationWarning]):
            Output only. Warnings that occurred during
            the cycle.
    """
    class State(proto.Enum):
        r"""Possible states of a replication cycle.

        Values:
            STATE_UNSPECIFIED (0):
                The state is unknown. This is used for API
                compatibility only and is not used by the
                system.
            RUNNING (1):
                The replication cycle is running.
            PAUSED (2):
                The replication cycle is paused.
            FAILED (3):
                The replication cycle finished with errors.
            SUCCEEDED (4):
                The replication cycle finished successfully.
        """
        STATE_UNSPECIFIED = 0
        RUNNING = 1
        PAUSED = 2
        FAILED = 3
        SUCCEEDED = 4

    name: str = proto.Field(
        proto.STRING,
        number=13,
    )
    cycle_number: int = proto.Field(
        proto.INT32,
        number=10,
    )
    start_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )
    total_pause_duration: duration_pb2.Duration = proto.Field(
        proto.MESSAGE,
        number=7,
        message=duration_pb2.Duration,
    )
    progress_percent: int = proto.Field(
        proto.INT32,
        number=5,
    )
    steps: MutableSequence['CycleStep'] = proto.RepeatedField(
        proto.MESSAGE,
        number=9,
        message='CycleStep',
    )
    state: State = proto.Field(
        proto.ENUM,
        number=11,
        enum=State,
    )
    error: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=12,
        message=status_pb2.Status,
    )
    warnings: MutableSequence['MigrationWarning'] = proto.RepeatedField(
        proto.MESSAGE,
        number=14,
        message='MigrationWarning',
    )


class CycleStep(proto.Message):
    r"""CycleStep holds information about a step progress.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        initializing_replication (google.events.cloud.vmmigration_v1.types.InitializingReplicationStep):
            Initializing replication step.

            This field is a member of `oneof`_ ``step``.
        replicating (google.events.cloud.vmmigration_v1.types.ReplicatingStep):
            Replicating step.

            This field is a member of `oneof`_ ``step``.
        post_processing (google.events.cloud.vmmigration_v1.types.PostProcessingStep):
            Post processing step.

            This field is a member of `oneof`_ ``step``.
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the cycle step has started.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the cycle step has ended.
    """

    initializing_replication: 'InitializingReplicationStep' = proto.Field(
        proto.MESSAGE,
        number=3,
        oneof='step',
        message='InitializingReplicationStep',
    )
    replicating: 'ReplicatingStep' = proto.Field(
        proto.MESSAGE,
        number=4,
        oneof='step',
        message='ReplicatingStep',
    )
    post_processing: 'PostProcessingStep' = proto.Field(
        proto.MESSAGE,
        number=5,
        oneof='step',
        message='PostProcessingStep',
    )
    start_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )


class InitializingReplicationStep(proto.Message):
    r"""InitializingReplicationStep contains specific step details.
    """


class ReplicatingStep(proto.Message):
    r"""ReplicatingStep contains specific step details.

    Attributes:
        total_bytes (int):
            Total bytes to be handled in the step.
        replicated_bytes (int):
            Replicated bytes in the step.
        last_two_minutes_average_bytes_per_second (int):
            The source disks replication rate for the
            last 2 minutes in bytes per second.
        last_thirty_minutes_average_bytes_per_second (int):
            The source disks replication rate for the
            last 30 minutes in bytes per second.
    """

    total_bytes: int = proto.Field(
        proto.INT64,
        number=1,
    )
    replicated_bytes: int = proto.Field(
        proto.INT64,
        number=2,
    )
    last_two_minutes_average_bytes_per_second: int = proto.Field(
        proto.INT64,
        number=3,
    )
    last_thirty_minutes_average_bytes_per_second: int = proto.Field(
        proto.INT64,
        number=4,
    )


class PostProcessingStep(proto.Message):
    r"""PostProcessingStep contains specific step details.
    """


class ReplicationSync(proto.Message):
    r"""ReplicationSync contain information about the last replica
    sync to the cloud.

    Attributes:
        last_sync_time (google.protobuf.timestamp_pb2.Timestamp):
            The most updated snapshot created time in the
            source that finished replication.
    """

    last_sync_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )


class MigratingVm(proto.Message):
    r"""MigratingVm describes the VM that will be migrated from a
    Source environment and its replication state.


    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        compute_engine_target_defaults (google.events.cloud.vmmigration_v1.types.ComputeEngineTargetDefaults):
            Details of the target VM in Compute Engine.

            This field is a member of `oneof`_ ``target_vm_defaults``.
        aws_source_vm_details (google.events.cloud.vmmigration_v1.types.AwsSourceVmDetails):
            Output only. Details of the VM from an AWS
            source.

            This field is a member of `oneof`_ ``source_vm_details``.
        name (str):
            Output only. The identifier of the
            MigratingVm.
        source_vm_id (str):
            The unique ID of the VM in the source.
            The VM's name in vSphere can be changed, so this
            is not the VM's name but rather its moRef id.
            This id is of the form vm-<num>.
        display_name (str):
            The display name attached to the MigratingVm
            by the user.
        description (str):
            The description attached to the migrating VM
            by the user.
        policy (google.events.cloud.vmmigration_v1.types.SchedulePolicy):
            The replication schedule policy.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the migrating VM was
            created (this refers to this resource and not to
            the time it was installed in the source).
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The last time the migrating VM
            resource was updated.
        last_sync (google.events.cloud.vmmigration_v1.types.ReplicationSync):
            Output only. The most updated snapshot
            created time in the source that finished
            replication.
        state (google.events.cloud.vmmigration_v1.types.MigratingVm.State):
            Output only. State of the MigratingVm.
        state_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The last time the migrating VM
            state was updated.
        current_sync_info (google.events.cloud.vmmigration_v1.types.ReplicationCycle):
            Output only. Details of the current running
            replication cycle.
        last_replication_cycle (google.events.cloud.vmmigration_v1.types.ReplicationCycle):
            Output only. Details of the last replication cycle. This
            will be updated whenever a replication cycle is finished and
            is not to be confused with last_sync which is only updated
            on successful replication cycles.
        group (str):
            Output only. The group this migrating vm is included in, if
            any. The group is represented by the full path of the
            appropriate [Group][google.cloud.vmmigration.v1.Group]
            resource.
        labels (MutableMapping[str, str]):
            The labels of the migrating VM.
        recent_clone_jobs (MutableSequence[google.events.cloud.vmmigration_v1.types.CloneJob]):
            Output only. The recent [clone
            jobs][google.cloud.vmmigration.v1.CloneJob] performed on the
            migrating VM. This field holds the vm's last completed clone
            job and the vm's running clone job, if one exists. Note: To
            have this field populated you need to explicitly request it
            via the "view" parameter of the Get/List request.
        error (google.rpc.status_pb2.Status):
            Output only. Provides details on the state of
            the Migrating VM in case of an error in
            replication.
        recent_cutover_jobs (MutableSequence[google.events.cloud.vmmigration_v1.types.CutoverJob]):
            Output only. The recent cutover jobs
            performed on the migrating VM. This field holds
            the vm's last completed cutover job and the vm's
            running cutover job, if one exists.
            Note: To have this field populated you need to
            explicitly request it via the "view" parameter
            of the Get/List request.
        cutover_forecast (google.events.cloud.vmmigration_v1.types.CutoverForecast):
            Output only. Provides details of future
            CutoverJobs of a MigratingVm. Set to empty when
            cutover forecast is unavailable.
    """
    class State(proto.Enum):
        r"""The possible values of the state/health of source VM.

        Values:
            STATE_UNSPECIFIED (0):
                The state was not sampled by the health
                checks yet.
            PENDING (1):
                The VM in the source is being verified.
            READY (2):
                The source VM was verified, and it's ready to
                start replication.
            FIRST_SYNC (3):
                Migration is going through the first sync
                cycle.
            ACTIVE (4):
                The replication is active, and it's running
                or scheduled to run.
            CUTTING_OVER (7):
                The source VM is being turned off, and a
                final replication is currently running.
            CUTOVER (8):
                The source VM was stopped and replicated. The
                replication is currently paused.
            FINAL_SYNC (9):
                A cutover job is active and replication cycle
                is running the final sync.
            PAUSED (10):
                The replication was paused by the user and no
                cycles are scheduled to run.
            FINALIZING (11):
                The migrating VM is being finalized and
                migration resources are being removed.
            FINALIZED (12):
                The replication process is done. The
                migrating VM is finalized and no longer consumes
                billable resources.
            ERROR (13):
                The replication process encountered an
                unrecoverable error and was aborted.
        """
        STATE_UNSPECIFIED = 0
        PENDING = 1
        READY = 2
        FIRST_SYNC = 3
        ACTIVE = 4
        CUTTING_OVER = 7
        CUTOVER = 8
        FINAL_SYNC = 9
        PAUSED = 10
        FINALIZING = 11
        FINALIZED = 12
        ERROR = 13

    compute_engine_target_defaults: 'ComputeEngineTargetDefaults' = proto.Field(
        proto.MESSAGE,
        number=26,
        oneof='target_vm_defaults',
        message='ComputeEngineTargetDefaults',
    )
    aws_source_vm_details: 'AwsSourceVmDetails' = proto.Field(
        proto.MESSAGE,
        number=29,
        oneof='source_vm_details',
        message='AwsSourceVmDetails',
    )
    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    source_vm_id: str = proto.Field(
        proto.STRING,
        number=2,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=18,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    policy: 'SchedulePolicy' = proto.Field(
        proto.MESSAGE,
        number=8,
        message='SchedulePolicy',
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=9,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=10,
        message=timestamp_pb2.Timestamp,
    )
    last_sync: 'ReplicationSync' = proto.Field(
        proto.MESSAGE,
        number=11,
        message='ReplicationSync',
    )
    state: State = proto.Field(
        proto.ENUM,
        number=23,
        enum=State,
    )
    state_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=22,
        message=timestamp_pb2.Timestamp,
    )
    current_sync_info: 'ReplicationCycle' = proto.Field(
        proto.MESSAGE,
        number=13,
        message='ReplicationCycle',
    )
    last_replication_cycle: 'ReplicationCycle' = proto.Field(
        proto.MESSAGE,
        number=32,
        message='ReplicationCycle',
    )
    group: str = proto.Field(
        proto.STRING,
        number=15,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=16,
    )
    recent_clone_jobs: MutableSequence['CloneJob'] = proto.RepeatedField(
        proto.MESSAGE,
        number=17,
        message='CloneJob',
    )
    error: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=19,
        message=status_pb2.Status,
    )
    recent_cutover_jobs: MutableSequence['CutoverJob'] = proto.RepeatedField(
        proto.MESSAGE,
        number=20,
        message='CutoverJob',
    )
    cutover_forecast: 'CutoverForecast' = proto.Field(
        proto.MESSAGE,
        number=33,
        message='CutoverForecast',
    )


class CutoverForecast(proto.Message):
    r"""CutoverForecast holds information about future CutoverJobs of
    a MigratingVm.

    Attributes:
        estimated_cutover_job_duration (google.protobuf.duration_pb2.Duration):
            Output only. Estimation of the CutoverJob
            duration.
    """

    estimated_cutover_job_duration: duration_pb2.Duration = proto.Field(
        proto.MESSAGE,
        number=1,
        message=duration_pb2.Duration,
    )


class CloneJob(proto.Message):
    r"""CloneJob describes the process of creating a clone of a
    [MigratingVM][google.cloud.vmmigration.v1.MigratingVm] to the
    requested target based on the latest successful uploaded snapshots.
    While the migration cycles of a MigratingVm take place, it is
    possible to verify the uploaded VM can be started in the cloud, by
    creating a clone. The clone can be created without any downtime, and
    it is created using the latest snapshots which are already in the
    cloud. The cloneJob is only responsible for its work, not its
    products, which means once it is finished, it will never touch the
    instance it created. It will only delete it in case of the CloneJob
    being cancelled or upon failure to clone.


    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        compute_engine_target_details (google.events.cloud.vmmigration_v1.types.ComputeEngineTargetDetails):
            Output only. Details of the target VM in
            Compute Engine.

            This field is a member of `oneof`_ ``target_vm_details``.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the clone job was
            created (as an API call, not when it was
            actually created in the target).
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the clone job was
            ended.
        name (str):
            Output only. The name of the clone.
        state (google.events.cloud.vmmigration_v1.types.CloneJob.State):
            Output only. State of the clone job.
        state_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the state was last
            updated.
        error (google.rpc.status_pb2.Status):
            Output only. Provides details for the errors
            that led to the Clone Job's state.
        steps (MutableSequence[google.events.cloud.vmmigration_v1.types.CloneStep]):
            Output only. The clone steps list
            representing its progress.
    """
    class State(proto.Enum):
        r"""Possible states of the clone job.

        Values:
            STATE_UNSPECIFIED (0):
                The state is unknown. This is used for API
                compatibility only and is not used by the
                system.
            PENDING (1):
                The clone job has not yet started.
            ACTIVE (2):
                The clone job is active and running.
            FAILED (3):
                The clone job finished with errors.
            SUCCEEDED (4):
                The clone job finished successfully.
            CANCELLED (5):
                The clone job was cancelled.
            CANCELLING (6):
                The clone job is being cancelled.
            ADAPTING_OS (7):
                OS adaptation is running as part of the clone
                job to generate license.
        """
        STATE_UNSPECIFIED = 0
        PENDING = 1
        ACTIVE = 2
        FAILED = 3
        SUCCEEDED = 4
        CANCELLED = 5
        CANCELLING = 6
        ADAPTING_OS = 7

    compute_engine_target_details: 'ComputeEngineTargetDetails' = proto.Field(
        proto.MESSAGE,
        number=20,
        oneof='target_vm_details',
        message='ComputeEngineTargetDetails',
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=22,
        message=timestamp_pb2.Timestamp,
    )
    name: str = proto.Field(
        proto.STRING,
        number=3,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=12,
        enum=State,
    )
    state_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=14,
        message=timestamp_pb2.Timestamp,
    )
    error: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=17,
        message=status_pb2.Status,
    )
    steps: MutableSequence['CloneStep'] = proto.RepeatedField(
        proto.MESSAGE,
        number=23,
        message='CloneStep',
    )


class CloneStep(proto.Message):
    r"""CloneStep holds information about the clone step progress.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        adapting_os (google.events.cloud.vmmigration_v1.types.AdaptingOSStep):
            Adapting OS step.

            This field is a member of `oneof`_ ``step``.
        preparing_vm_disks (google.events.cloud.vmmigration_v1.types.PreparingVMDisksStep):
            Preparing VM disks step.

            This field is a member of `oneof`_ ``step``.
        instantiating_migrated_vm (google.events.cloud.vmmigration_v1.types.InstantiatingMigratedVMStep):
            Instantiating migrated VM step.

            This field is a member of `oneof`_ ``step``.
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the step has started.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the step has ended.
    """

    adapting_os: 'AdaptingOSStep' = proto.Field(
        proto.MESSAGE,
        number=3,
        oneof='step',
        message='AdaptingOSStep',
    )
    preparing_vm_disks: 'PreparingVMDisksStep' = proto.Field(
        proto.MESSAGE,
        number=4,
        oneof='step',
        message='PreparingVMDisksStep',
    )
    instantiating_migrated_vm: 'InstantiatingMigratedVMStep' = proto.Field(
        proto.MESSAGE,
        number=5,
        oneof='step',
        message='InstantiatingMigratedVMStep',
    )
    start_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )


class AdaptingOSStep(proto.Message):
    r"""AdaptingOSStep contains specific step details.
    """


class PreparingVMDisksStep(proto.Message):
    r"""PreparingVMDisksStep contains specific step details.
    """


class InstantiatingMigratedVMStep(proto.Message):
    r"""InstantiatingMigratedVMStep contains specific step details.
    """


class CutoverJob(proto.Message):
    r"""CutoverJob message describes a cutover of a migrating VM. The
    CutoverJob is the operation of shutting down the VM, creating a
    snapshot and clonning the VM using the replicated snapshot.


    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        compute_engine_target_details (google.events.cloud.vmmigration_v1.types.ComputeEngineTargetDetails):
            Output only. Details of the target VM in
            Compute Engine.

            This field is a member of `oneof`_ ``target_vm_details``.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the cutover job was
            created (as an API call, not when it was
            actually created in the target).
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the cutover job had
            finished.
        name (str):
            Output only. The name of the cutover job.
        state (google.events.cloud.vmmigration_v1.types.CutoverJob.State):
            Output only. State of the cutover job.
        state_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the state was last
            updated.
        progress_percent (int):
            Output only. The current progress in
            percentage of the cutover job.
        error (google.rpc.status_pb2.Status):
            Output only. Provides details for the errors
            that led to the Cutover Job's state.
        state_message (str):
            Output only. A message providing possible
            extra details about the current state.
        steps (MutableSequence[google.events.cloud.vmmigration_v1.types.CutoverStep]):
            Output only. The cutover steps list
            representing its progress.
    """
    class State(proto.Enum):
        r"""Possible states of the cutover job.

        Values:
            STATE_UNSPECIFIED (0):
                The state is unknown. This is used for API
                compatibility only and is not used by the
                system.
            PENDING (1):
                The cutover job has not yet started.
            FAILED (2):
                The cutover job finished with errors.
            SUCCEEDED (3):
                The cutover job finished successfully.
            CANCELLED (4):
                The cutover job was cancelled.
            CANCELLING (5):
                The cutover job is being cancelled.
            ACTIVE (6):
                The cutover job is active and running.
            ADAPTING_OS (7):
                OS adaptation is running as part of the
                cutover job to generate license.
        """
        STATE_UNSPECIFIED = 0
        PENDING = 1
        FAILED = 2
        SUCCEEDED = 3
        CANCELLED = 4
        CANCELLING = 5
        ACTIVE = 6
        ADAPTING_OS = 7

    compute_engine_target_details: 'ComputeEngineTargetDetails' = proto.Field(
        proto.MESSAGE,
        number=14,
        oneof='target_vm_details',
        message='ComputeEngineTargetDetails',
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=16,
        message=timestamp_pb2.Timestamp,
    )
    name: str = proto.Field(
        proto.STRING,
        number=3,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=5,
        enum=State,
    )
    state_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )
    progress_percent: int = proto.Field(
        proto.INT32,
        number=13,
    )
    error: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=9,
        message=status_pb2.Status,
    )
    state_message: str = proto.Field(
        proto.STRING,
        number=10,
    )
    steps: MutableSequence['CutoverStep'] = proto.RepeatedField(
        proto.MESSAGE,
        number=17,
        message='CutoverStep',
    )


class CutoverStep(proto.Message):
    r"""CutoverStep holds information about the cutover step
    progress.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        previous_replication_cycle (google.events.cloud.vmmigration_v1.types.ReplicationCycle):
            A replication cycle prior cutover step.

            This field is a member of `oneof`_ ``step``.
        shutting_down_source_vm (google.events.cloud.vmmigration_v1.types.ShuttingDownSourceVMStep):
            Shutting down VM step.

            This field is a member of `oneof`_ ``step``.
        final_sync (google.events.cloud.vmmigration_v1.types.ReplicationCycle):
            Final sync step.

            This field is a member of `oneof`_ ``step``.
        preparing_vm_disks (google.events.cloud.vmmigration_v1.types.PreparingVMDisksStep):
            Preparing VM disks step.

            This field is a member of `oneof`_ ``step``.
        instantiating_migrated_vm (google.events.cloud.vmmigration_v1.types.InstantiatingMigratedVMStep):
            Instantiating migrated VM step.

            This field is a member of `oneof`_ ``step``.
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the step has started.
        end_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the step has ended.
    """

    previous_replication_cycle: 'ReplicationCycle' = proto.Field(
        proto.MESSAGE,
        number=3,
        oneof='step',
        message='ReplicationCycle',
    )
    shutting_down_source_vm: 'ShuttingDownSourceVMStep' = proto.Field(
        proto.MESSAGE,
        number=4,
        oneof='step',
        message='ShuttingDownSourceVMStep',
    )
    final_sync: 'ReplicationCycle' = proto.Field(
        proto.MESSAGE,
        number=5,
        oneof='step',
        message='ReplicationCycle',
    )
    preparing_vm_disks: 'PreparingVMDisksStep' = proto.Field(
        proto.MESSAGE,
        number=6,
        oneof='step',
        message='PreparingVMDisksStep',
    )
    instantiating_migrated_vm: 'InstantiatingMigratedVMStep' = proto.Field(
        proto.MESSAGE,
        number=7,
        oneof='step',
        message='InstantiatingMigratedVMStep',
    )
    start_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )


class ShuttingDownSourceVMStep(proto.Message):
    r"""ShuttingDownSourceVMStep contains specific step details.
    """


class Source(proto.Message):
    r"""Source message describes a specific vm migration Source
    resource. It contains the source environment information.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        vmware (google.events.cloud.vmmigration_v1.types.VmwareSourceDetails):
            Vmware type source details.

            This field is a member of `oneof`_ ``source_details``.
        aws (google.events.cloud.vmmigration_v1.types.AwsSourceDetails):
            AWS type source details.

            This field is a member of `oneof`_ ``source_details``.
        name (str):
            Output only. The Source name.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The create time timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The update time timestamp.
        labels (MutableMapping[str, str]):
            The labels of the source.
        description (str):
            User-provided description of the source.
    """

    vmware: 'VmwareSourceDetails' = proto.Field(
        proto.MESSAGE,
        number=10,
        oneof='source_details',
        message='VmwareSourceDetails',
    )
    aws: 'AwsSourceDetails' = proto.Field(
        proto.MESSAGE,
        number=12,
        oneof='source_details',
        message='AwsSourceDetails',
    )
    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    description: str = proto.Field(
        proto.STRING,
        number=6,
    )


class VmwareSourceDetails(proto.Message):
    r"""VmwareSourceDetails message describes a specific source
    details for the vmware source type.

    Attributes:
        username (str):
            The credentials username.
        vcenter_ip (str):
            The ip address of the vcenter this Source
            represents.
        thumbprint (str):
            The thumbprint representing the certificate
            for the vcenter.
        resolved_vcenter_host (str):
            The hostname of the vcenter.
    """

    username: str = proto.Field(
        proto.STRING,
        number=1,
    )
    vcenter_ip: str = proto.Field(
        proto.STRING,
        number=3,
    )
    thumbprint: str = proto.Field(
        proto.STRING,
        number=4,
    )
    resolved_vcenter_host: str = proto.Field(
        proto.STRING,
        number=5,
    )


class AwsSourceDetails(proto.Message):
    r"""AwsSourceDetails message describes a specific source details
    for the AWS source type.


    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        access_key_creds (google.events.cloud.vmmigration_v1.types.AwsSourceDetails.AccessKeyCredentials):
            AWS Credentials using access key id and
            secret.

            This field is a member of `oneof`_ ``credentials_type``.
        aws_region (str):
            Immutable. The AWS region that the source VMs
            will be migrated from.
        state (google.events.cloud.vmmigration_v1.types.AwsSourceDetails.State):
            Output only. State of the source as
            determined by the health check.
        error (google.rpc.status_pb2.Status):
            Output only. Provides details on the state of
            the Source in case of an error.
        inventory_tag_list (MutableSequence[google.events.cloud.vmmigration_v1.types.AwsSourceDetails.Tag]):
            AWS resource tags to limit the scope of the
            source inventory.
        inventory_security_group_names (MutableSequence[str]):
            AWS security group names to limit the scope
            of the source inventory.
        migration_resources_user_tags (MutableMapping[str, str]):
            User specified tags to add to every M2VM generated resource
            in AWS. These tags will be set in addition to the default
            tags that are set as part of the migration process. The tags
            must not begin with the reserved prefix ``m2vm``.
        public_ip (str):
            Output only. The source's public IP. All
            communication initiated by this source will
            originate from this IP.
    """
    class State(proto.Enum):
        r"""The possible values of the state.

        Values:
            STATE_UNSPECIFIED (0):
                The state is unknown. This is used for API
                compatibility only and is not used by the
                system.
            PENDING (1):
                The state was not sampled by the health
                checks yet.
            FAILED (2):
                The source is available but might not be
                usable yet due to invalid credentials or another
                reason. The error message will contain further
                details.
            ACTIVE (3):
                The source exists and its credentials were
                verified.
        """
        STATE_UNSPECIFIED = 0
        PENDING = 1
        FAILED = 2
        ACTIVE = 3

    class AccessKeyCredentials(proto.Message):
        r"""Message describing AWS Credentials using access key id and
        secret.

        Attributes:
            access_key_id (str):
                AWS access key ID.
        """

        access_key_id: str = proto.Field(
            proto.STRING,
            number=1,
        )

    class Tag(proto.Message):
        r"""Tag is an AWS tag representation.

        Attributes:
            key (str):
                Key of tag.
            value (str):
                Value of tag.
        """

        key: str = proto.Field(
            proto.STRING,
            number=1,
        )
        value: str = proto.Field(
            proto.STRING,
            number=2,
        )

    access_key_creds: AccessKeyCredentials = proto.Field(
        proto.MESSAGE,
        number=11,
        oneof='credentials_type',
        message=AccessKeyCredentials,
    )
    aws_region: str = proto.Field(
        proto.STRING,
        number=3,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=4,
        enum=State,
    )
    error: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=5,
        message=status_pb2.Status,
    )
    inventory_tag_list: MutableSequence[Tag] = proto.RepeatedField(
        proto.MESSAGE,
        number=10,
        message=Tag,
    )
    inventory_security_group_names: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=7,
    )
    migration_resources_user_tags: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=8,
    )
    public_ip: str = proto.Field(
        proto.STRING,
        number=9,
    )


class DatacenterConnector(proto.Message):
    r"""DatacenterConnector message describes a connector between the
    Source and Google Cloud, which is installed on a vmware
    datacenter (an OVA vm installed by the user) to connect the
    Datacenter to Google Cloud and support vm migration data
    transfer.

    Attributes:
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the connector was
            created (as an API call, not when it was
            actually installed).
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The last time the connector was
            updated with an API call.
        name (str):
            Output only. The connector's name.
        registration_id (str):
            Immutable. A unique key for this connector.
            This key is internal to the OVA connector and is
            supplied with its creation during the
            registration process and can not be modified.
        service_account (str):
            The service account to use in the connector
            when communicating with the cloud.
        version (str):
            The version running in the
            DatacenterConnector. This is supplied by the OVA
            connector during the registration process and
            can not be modified.
        bucket (str):
            Output only. The communication channel
            between the datacenter connector and Google
            Cloud.
        state (google.events.cloud.vmmigration_v1.types.DatacenterConnector.State):
            Output only. State of the
            DatacenterConnector, as determined by the health
            checks.
        state_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the state was last set.
        error (google.rpc.status_pb2.Status):
            Output only. Provides details on the state of
            the Datacenter Connector in case of an error.
        appliance_infrastructure_version (str):
            Output only. Appliance OVA version.
            This is the OVA which is manually installed by
            the user and contains the infrastructure for the
            automatically updatable components on the
            appliance.
        appliance_software_version (str):
            Output only. Appliance last installed update
            bundle version. This is the version of the
            automatically updatable components on the
            appliance.
        available_versions (google.events.cloud.vmmigration_v1.types.AvailableUpdates):
            Output only. The available versions for
            updating this appliance.
        upgrade_status (google.events.cloud.vmmigration_v1.types.UpgradeStatus):
            Output only. The status of the current / last
            upgradeAppliance operation.
    """
    class State(proto.Enum):
        r"""The possible values of the state.

        Values:
            STATE_UNSPECIFIED (0):
                The state is unknown. This is used for API
                compatibility only and is not used by the
                system.
            PENDING (1):
                The state was not sampled by the health
                checks yet.
            OFFLINE (2):
                The source was sampled by health checks and
                is not available.
            FAILED (3):
                The source is available but might not be
                usable yet due to unvalidated credentials or
                another reason. The credentials referred to are
                the ones to the Source. The error message will
                contain further details.
            ACTIVE (4):
                The source exists and its credentials were
                verified.
        """
        STATE_UNSPECIFIED = 0
        PENDING = 1
        OFFLINE = 2
        FAILED = 3
        ACTIVE = 4

    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    name: str = proto.Field(
        proto.STRING,
        number=3,
    )
    registration_id: str = proto.Field(
        proto.STRING,
        number=12,
    )
    service_account: str = proto.Field(
        proto.STRING,
        number=5,
    )
    version: str = proto.Field(
        proto.STRING,
        number=6,
    )
    bucket: str = proto.Field(
        proto.STRING,
        number=10,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=7,
        enum=State,
    )
    state_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=8,
        message=timestamp_pb2.Timestamp,
    )
    error: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=11,
        message=status_pb2.Status,
    )
    appliance_infrastructure_version: str = proto.Field(
        proto.STRING,
        number=13,
    )
    appliance_software_version: str = proto.Field(
        proto.STRING,
        number=14,
    )
    available_versions: 'AvailableUpdates' = proto.Field(
        proto.MESSAGE,
        number=15,
        message='AvailableUpdates',
    )
    upgrade_status: 'UpgradeStatus' = proto.Field(
        proto.MESSAGE,
        number=16,
        message='UpgradeStatus',
    )


class UpgradeStatus(proto.Message):
    r"""UpgradeStatus contains information about upgradeAppliance
    operation.

    Attributes:
        version (str):
            The version to upgrade to.
        state (google.events.cloud.vmmigration_v1.types.UpgradeStatus.State):
            The state of the upgradeAppliance operation.
        error (google.rpc.status_pb2.Status):
            Provides details on the state of the upgrade
            operation in case of an error.
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the operation was started.
        previous_version (str):
            The version from which we upgraded.
    """
    class State(proto.Enum):
        r"""The possible values of the state.

        Values:
            STATE_UNSPECIFIED (0):
                The state was not sampled by the health
                checks yet.
            RUNNING (1):
                The upgrade has started.
            FAILED (2):
                The upgrade failed.
            SUCCEEDED (3):
                The upgrade finished successfully.
        """
        STATE_UNSPECIFIED = 0
        RUNNING = 1
        FAILED = 2
        SUCCEEDED = 3

    version: str = proto.Field(
        proto.STRING,
        number=1,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=2,
        enum=State,
    )
    error: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=3,
        message=status_pb2.Status,
    )
    start_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )
    previous_version: str = proto.Field(
        proto.STRING,
        number=5,
    )


class AvailableUpdates(proto.Message):
    r"""Holds informatiom about the available versions for upgrade.

    Attributes:
        new_deployable_appliance (google.events.cloud.vmmigration_v1.types.ApplianceVersion):
            The newest deployable version of the
            appliance. The current appliance can't be
            updated into this version, and the owner must
            manually deploy this OVA to a new appliance.
        in_place_update (google.events.cloud.vmmigration_v1.types.ApplianceVersion):
            The latest version for in place update.
            The current appliance can be updated to this
            version using the API or m4c CLI.
    """

    new_deployable_appliance: 'ApplianceVersion' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='ApplianceVersion',
    )
    in_place_update: 'ApplianceVersion' = proto.Field(
        proto.MESSAGE,
        number=2,
        message='ApplianceVersion',
    )


class ApplianceVersion(proto.Message):
    r"""Describes an appliance version.

    Attributes:
        version (str):
            The appliance version.
        uri (str):
            A link for downloading the version.
        critical (bool):
            Determine whether it's critical to upgrade
            the appliance to this version.
        release_notes_uri (str):
            Link to a page that contains the version
            release notes.
    """

    version: str = proto.Field(
        proto.STRING,
        number=1,
    )
    uri: str = proto.Field(
        proto.STRING,
        number=2,
    )
    critical: bool = proto.Field(
        proto.BOOL,
        number=3,
    )
    release_notes_uri: str = proto.Field(
        proto.STRING,
        number=4,
    )


class VmwareVmDetails(proto.Message):
    r"""VmwareVmDetails describes a VM in vCenter.

    Attributes:
        vm_id (str):
            The VM's id in the source (note that this is
            not the MigratingVm's id). This is the moref id
            of the VM.
        datacenter_id (str):
            The id of the vCenter's datacenter this VM is
            contained in.
        datacenter_description (str):
            The descriptive name of the vCenter's
            datacenter this VM is contained in.
        uuid (str):
            The unique identifier of the VM in vCenter.
        display_name (str):
            The display name of the VM. Note that this is
            not necessarily unique.
        power_state (google.events.cloud.vmmigration_v1.types.VmwareVmDetails.PowerState):
            The power state of the VM at the moment list
            was taken.
        cpu_count (int):
            The number of cpus in the VM.
        memory_mb (int):
            The size of the memory of the VM in MB.
        disk_count (int):
            The number of disks the VM has.
        committed_storage_mb (int):
            The total size of the storage allocated to
            the VM in MB.
        guest_description (str):
            The VM's OS. See for example
            https://vdc-repo.vmware.com/vmwb-repository/dcr-public/da47f910-60ac-438b-8b9b-6122f4d14524/16b7274a-bf8b-4b4c-a05e-746f2aa93c8c/doc/vim.vm.GuestOsDescriptor.GuestOsIdentifier.html
            for types of strings this might hold.
        boot_option (google.events.cloud.vmmigration_v1.types.VmwareVmDetails.BootOption):
            Output only. The VM Boot Option.
    """
    class PowerState(proto.Enum):
        r"""Possible values for the power state of the VM.

        Values:
            POWER_STATE_UNSPECIFIED (0):
                Power state is not specified.
            ON (1):
                The VM is turned ON.
            OFF (2):
                The VM is turned OFF.
            SUSPENDED (3):
                The VM is suspended. This is similar to
                hibernation or sleep mode.
        """
        POWER_STATE_UNSPECIFIED = 0
        ON = 1
        OFF = 2
        SUSPENDED = 3

    class BootOption(proto.Enum):
        r"""Possible values for vm boot option.

        Values:
            BOOT_OPTION_UNSPECIFIED (0):
                The boot option is unknown.
            EFI (1):
                The boot option is EFI.
            BIOS (2):
                The boot option is BIOS.
        """
        BOOT_OPTION_UNSPECIFIED = 0
        EFI = 1
        BIOS = 2

    vm_id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    datacenter_id: str = proto.Field(
        proto.STRING,
        number=2,
    )
    datacenter_description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    uuid: str = proto.Field(
        proto.STRING,
        number=4,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=5,
    )
    power_state: PowerState = proto.Field(
        proto.ENUM,
        number=6,
        enum=PowerState,
    )
    cpu_count: int = proto.Field(
        proto.INT32,
        number=7,
    )
    memory_mb: int = proto.Field(
        proto.INT32,
        number=8,
    )
    disk_count: int = proto.Field(
        proto.INT32,
        number=9,
    )
    committed_storage_mb: int = proto.Field(
        proto.INT64,
        number=12,
    )
    guest_description: str = proto.Field(
        proto.STRING,
        number=11,
    )
    boot_option: BootOption = proto.Field(
        proto.ENUM,
        number=13,
        enum=BootOption,
    )


class UtilizationReport(proto.Message):
    r"""Utilization report details the utilization (CPU, memory,
    etc.) of selected source VMs.

    Attributes:
        name (str):
            Output only. The report unique name.
        display_name (str):
            The report display name, as assigned by the
            user.
        state (google.events.cloud.vmmigration_v1.types.UtilizationReport.State):
            Output only. Current state of the report.
        state_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the state was last set.
        error (google.rpc.status_pb2.Status):
            Output only. Provides details on the state of
            the report in case of an error.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time the report was created
            (this refers to the time of the request, not the
            time the report creation completed).
        time_frame (google.events.cloud.vmmigration_v1.types.UtilizationReport.TimeFrame):
            Time frame of the report.
        frame_end_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The point in time when the time frame ends.
            Notice that the time frame is counted backwards. For
            instance if the "frame_end_time" value is 2021/01/20 and the
            time frame is WEEK then the report covers the week between
            2021/01/20 and 2021/01/14.
        vm_count (int):
            Output only. Total number of VMs included in
            the report.
        vms (MutableSequence[google.events.cloud.vmmigration_v1.types.VmUtilizationInfo]):
            List of utilization information per VM. When sent as part of
            the request, the "vm_id" field is used in order to specify
            which VMs to include in the report. In that case all other
            fields are ignored.
    """
    class State(proto.Enum):
        r"""Utilization report state.

        Values:
            STATE_UNSPECIFIED (0):
                The state is unknown. This value is not in
                use.
            CREATING (1):
                The report is in the making.
            SUCCEEDED (2):
                Report creation completed successfully.
            FAILED (3):
                Report creation failed.
        """
        STATE_UNSPECIFIED = 0
        CREATING = 1
        SUCCEEDED = 2
        FAILED = 3

    class TimeFrame(proto.Enum):
        r"""Report time frame options.

        Values:
            TIME_FRAME_UNSPECIFIED (0):
                The time frame was not specified and will
                default to WEEK.
            WEEK (1):
                One week.
            MONTH (2):
                One month.
            YEAR (3):
                One year.
        """
        TIME_FRAME_UNSPECIFIED = 0
        WEEK = 1
        MONTH = 2
        YEAR = 3

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=3,
        enum=State,
    )
    state_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )
    error: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=5,
        message=status_pb2.Status,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )
    time_frame: TimeFrame = proto.Field(
        proto.ENUM,
        number=7,
        enum=TimeFrame,
    )
    frame_end_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=8,
        message=timestamp_pb2.Timestamp,
    )
    vm_count: int = proto.Field(
        proto.INT32,
        number=9,
    )
    vms: MutableSequence['VmUtilizationInfo'] = proto.RepeatedField(
        proto.MESSAGE,
        number=10,
        message='VmUtilizationInfo',
    )


class VmUtilizationInfo(proto.Message):
    r"""Utilization information of a single VM.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        vmware_vm_details (google.events.cloud.vmmigration_v1.types.VmwareVmDetails):
            The description of the VM in a Source of type
            Vmware.

            This field is a member of `oneof`_ ``VmDetails``.
        vm_id (str):
            The VM's ID in the source.
        utilization (google.events.cloud.vmmigration_v1.types.VmUtilizationMetrics):
            Utilization metrics for this VM.
    """

    vmware_vm_details: 'VmwareVmDetails' = proto.Field(
        proto.MESSAGE,
        number=1,
        oneof='VmDetails',
        message='VmwareVmDetails',
    )
    vm_id: str = proto.Field(
        proto.STRING,
        number=3,
    )
    utilization: 'VmUtilizationMetrics' = proto.Field(
        proto.MESSAGE,
        number=2,
        message='VmUtilizationMetrics',
    )


class VmUtilizationMetrics(proto.Message):
    r"""Utilization metrics values for a single VM.

    Attributes:
        cpu_max_percent (int):
            Max CPU usage, percent.
        cpu_average_percent (int):
            Average CPU usage, percent.
        memory_max_percent (int):
            Max memory usage, percent.
        memory_average_percent (int):
            Average memory usage, percent.
        disk_io_rate_max_kbps (int):
            Max disk IO rate, in kilobytes per second.
        disk_io_rate_average_kbps (int):
            Average disk IO rate, in kilobytes per
            second.
        network_throughput_max_kbps (int):
            Max network throughput (combined
            transmit-rates and receive-rates), in kilobytes
            per second.
        network_throughput_average_kbps (int):
            Average network throughput (combined
            transmit-rates and receive-rates), in kilobytes
            per second.
    """

    cpu_max_percent: int = proto.Field(
        proto.INT32,
        number=9,
    )
    cpu_average_percent: int = proto.Field(
        proto.INT32,
        number=10,
    )
    memory_max_percent: int = proto.Field(
        proto.INT32,
        number=11,
    )
    memory_average_percent: int = proto.Field(
        proto.INT32,
        number=12,
    )
    disk_io_rate_max_kbps: int = proto.Field(
        proto.INT64,
        number=13,
    )
    disk_io_rate_average_kbps: int = proto.Field(
        proto.INT64,
        number=14,
    )
    network_throughput_max_kbps: int = proto.Field(
        proto.INT64,
        number=15,
    )
    network_throughput_average_kbps: int = proto.Field(
        proto.INT64,
        number=16,
    )


class ComputeEngineTargetDefaults(proto.Message):
    r"""ComputeEngineTargetDefaults is a collection of details for
    creating a VM in a target Compute Engine project.

    Attributes:
        vm_name (str):
            The name of the VM to create.
        target_project (str):
            The full path of the resource of type
            TargetProject which represents the Compute
            Engine project in which to create this VM.
        zone (str):
            The zone in which to create the VM.
        machine_type_series (str):
            The machine type series to create the VM
            with.
        machine_type (str):
            The machine type to create the VM with.
        network_tags (MutableSequence[str]):
            A map of network tags to associate with the
            VM.
        network_interfaces (MutableSequence[google.events.cloud.vmmigration_v1.types.NetworkInterface]):
            List of NICs connected to this VM.
        service_account (str):
            The service account to associate the VM with.
        disk_type (google.events.cloud.vmmigration_v1.types.ComputeEngineDiskType):
            The disk type to use in the VM.
        labels (MutableMapping[str, str]):
            A map of labels to associate with the VM.
        license_type (google.events.cloud.vmmigration_v1.types.ComputeEngineLicenseType):
            The license type to use in OS adaptation.
        applied_license (google.events.cloud.vmmigration_v1.types.AppliedLicense):
            Output only. The OS license returned from the
            adaptation module report.
        compute_scheduling (google.events.cloud.vmmigration_v1.types.ComputeScheduling):
            Compute instance scheduling information (if
            empty default is used).
        secure_boot (bool):
            Defines whether the instance has Secure Boot
            enabled. This can be set to true only if the vm
            boot option is EFI.
        boot_option (google.events.cloud.vmmigration_v1.types.ComputeEngineBootOption):
            Output only. The VM Boot Option, as set in
            the source vm.
        metadata (MutableMapping[str, str]):
            The metadata key/value pairs to assign to the
            VM.
        additional_licenses (MutableSequence[str]):
            Additional licenses to assign to the VM.
        hostname (str):
            The hostname to assign to the VM.
    """

    vm_name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    target_project: str = proto.Field(
        proto.STRING,
        number=2,
    )
    zone: str = proto.Field(
        proto.STRING,
        number=3,
    )
    machine_type_series: str = proto.Field(
        proto.STRING,
        number=4,
    )
    machine_type: str = proto.Field(
        proto.STRING,
        number=5,
    )
    network_tags: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=6,
    )
    network_interfaces: MutableSequence['NetworkInterface'] = proto.RepeatedField(
        proto.MESSAGE,
        number=7,
        message='NetworkInterface',
    )
    service_account: str = proto.Field(
        proto.STRING,
        number=8,
    )
    disk_type: 'ComputeEngineDiskType' = proto.Field(
        proto.ENUM,
        number=9,
        enum='ComputeEngineDiskType',
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=10,
    )
    license_type: 'ComputeEngineLicenseType' = proto.Field(
        proto.ENUM,
        number=11,
        enum='ComputeEngineLicenseType',
    )
    applied_license: 'AppliedLicense' = proto.Field(
        proto.MESSAGE,
        number=12,
        message='AppliedLicense',
    )
    compute_scheduling: 'ComputeScheduling' = proto.Field(
        proto.MESSAGE,
        number=13,
        message='ComputeScheduling',
    )
    secure_boot: bool = proto.Field(
        proto.BOOL,
        number=14,
    )
    boot_option: 'ComputeEngineBootOption' = proto.Field(
        proto.ENUM,
        number=15,
        enum='ComputeEngineBootOption',
    )
    metadata: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=16,
    )
    additional_licenses: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=17,
    )
    hostname: str = proto.Field(
        proto.STRING,
        number=18,
    )


class ComputeEngineTargetDetails(proto.Message):
    r"""ComputeEngineTargetDetails is a collection of details for
    creating a VM in a target Compute Engine project.

    Attributes:
        vm_name (str):
            The name of the VM to create.
        project (str):
            The Google Cloud target project ID or project
            name.
        zone (str):
            The zone in which to create the VM.
        machine_type_series (str):
            The machine type series to create the VM
            with.
        machine_type (str):
            The machine type to create the VM with.
        network_tags (MutableSequence[str]):
            A map of network tags to associate with the
            VM.
        network_interfaces (MutableSequence[google.events.cloud.vmmigration_v1.types.NetworkInterface]):
            List of NICs connected to this VM.
        service_account (str):
            The service account to associate the VM with.
        disk_type (google.events.cloud.vmmigration_v1.types.ComputeEngineDiskType):
            The disk type to use in the VM.
        labels (MutableMapping[str, str]):
            A map of labels to associate with the VM.
        license_type (google.events.cloud.vmmigration_v1.types.ComputeEngineLicenseType):
            The license type to use in OS adaptation.
        applied_license (google.events.cloud.vmmigration_v1.types.AppliedLicense):
            The OS license returned from the adaptation
            module report.
        compute_scheduling (google.events.cloud.vmmigration_v1.types.ComputeScheduling):
            Compute instance scheduling information (if
            empty default is used).
        secure_boot (bool):
            Defines whether the instance has Secure Boot
            enabled. This can be set to true only if the vm
            boot option is EFI.
        boot_option (google.events.cloud.vmmigration_v1.types.ComputeEngineBootOption):
            The VM Boot Option, as set in the source vm.
        metadata (MutableMapping[str, str]):
            The metadata key/value pairs to assign to the
            VM.
        additional_licenses (MutableSequence[str]):
            Additional licenses to assign to the VM.
        hostname (str):
            The hostname to assign to the VM.
    """

    vm_name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    project: str = proto.Field(
        proto.STRING,
        number=2,
    )
    zone: str = proto.Field(
        proto.STRING,
        number=3,
    )
    machine_type_series: str = proto.Field(
        proto.STRING,
        number=4,
    )
    machine_type: str = proto.Field(
        proto.STRING,
        number=5,
    )
    network_tags: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=6,
    )
    network_interfaces: MutableSequence['NetworkInterface'] = proto.RepeatedField(
        proto.MESSAGE,
        number=7,
        message='NetworkInterface',
    )
    service_account: str = proto.Field(
        proto.STRING,
        number=8,
    )
    disk_type: 'ComputeEngineDiskType' = proto.Field(
        proto.ENUM,
        number=9,
        enum='ComputeEngineDiskType',
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=10,
    )
    license_type: 'ComputeEngineLicenseType' = proto.Field(
        proto.ENUM,
        number=11,
        enum='ComputeEngineLicenseType',
    )
    applied_license: 'AppliedLicense' = proto.Field(
        proto.MESSAGE,
        number=12,
        message='AppliedLicense',
    )
    compute_scheduling: 'ComputeScheduling' = proto.Field(
        proto.MESSAGE,
        number=13,
        message='ComputeScheduling',
    )
    secure_boot: bool = proto.Field(
        proto.BOOL,
        number=14,
    )
    boot_option: 'ComputeEngineBootOption' = proto.Field(
        proto.ENUM,
        number=15,
        enum='ComputeEngineBootOption',
    )
    metadata: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=16,
    )
    additional_licenses: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=17,
    )
    hostname: str = proto.Field(
        proto.STRING,
        number=18,
    )


class NetworkInterface(proto.Message):
    r"""NetworkInterface represents a NIC of a VM.

    Attributes:
        network (str):
            The network to connect the NIC to.
        subnetwork (str):
            The subnetwork to connect the NIC to.
        internal_ip (str):
            The internal IP to define in the NIC. The formats accepted
            are: ``ephemeral`` \\ ipv4 address \\ a named address
            resource full path.
        external_ip (str):
            The external IP to define in the NIC.
    """

    network: str = proto.Field(
        proto.STRING,
        number=1,
    )
    subnetwork: str = proto.Field(
        proto.STRING,
        number=2,
    )
    internal_ip: str = proto.Field(
        proto.STRING,
        number=3,
    )
    external_ip: str = proto.Field(
        proto.STRING,
        number=4,
    )


class AppliedLicense(proto.Message):
    r"""AppliedLicense holds the license data returned by adaptation
    module report.

    Attributes:
        type_ (google.events.cloud.vmmigration_v1.types.AppliedLicense.Type):
            The license type that was used in OS
            adaptation.
        os_license (str):
            The OS license returned from the adaptation
            module's report.
    """
    class Type(proto.Enum):
        r"""License types used in OS adaptation.

        Values:
            TYPE_UNSPECIFIED (0):
                Unspecified license for the OS.
            NONE (1):
                No license available for the OS.
            PAYG (2):
                The license type is Pay As You Go license
                type.
            BYOL (3):
                The license type is Bring Your Own License
                type.
        """
        TYPE_UNSPECIFIED = 0
        NONE = 1
        PAYG = 2
        BYOL = 3

    type_: Type = proto.Field(
        proto.ENUM,
        number=1,
        enum=Type,
    )
    os_license: str = proto.Field(
        proto.STRING,
        number=2,
    )


class SchedulingNodeAffinity(proto.Message):
    r"""Node Affinity: the configuration of desired nodes onto which
    this Instance could be scheduled. Based on
    https://cloud.google.com/compute/docs/reference/rest/v1/instances/setScheduling

    Attributes:
        key (str):
            The label key of Node resource to reference.
        operator (google.events.cloud.vmmigration_v1.types.SchedulingNodeAffinity.Operator):
            The operator to use for the node resources specified in the
            ``values`` parameter.
        values (MutableSequence[str]):
            Corresponds to the label values of Node
            resource.
    """
    class Operator(proto.Enum):
        r"""Possible types of node selection operators. Valid operators are IN
        for affinity and NOT_IN for anti-affinity.

        Values:
            OPERATOR_UNSPECIFIED (0):
                An unknown, unexpected behavior.
            IN (1):
                The node resource group should be in these
                resources affinity.
            NOT_IN (2):
                The node resource group should not be in
                these resources affinity.
        """
        OPERATOR_UNSPECIFIED = 0
        IN = 1
        NOT_IN = 2

    key: str = proto.Field(
        proto.STRING,
        number=1,
    )
    operator: Operator = proto.Field(
        proto.ENUM,
        number=2,
        enum=Operator,
    )
    values: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=3,
    )


class ComputeScheduling(proto.Message):
    r"""Scheduling information for VM on maintenance/restart
    behaviour and node allocation in sole tenant nodes.

    Attributes:
        on_host_maintenance (google.events.cloud.vmmigration_v1.types.ComputeScheduling.OnHostMaintenance):
            How the instance should behave when the host
            machine undergoes maintenance that may
            temporarily impact instance performance.
        restart_type (google.events.cloud.vmmigration_v1.types.ComputeScheduling.RestartType):
            Whether the Instance should be automatically restarted
            whenever it is terminated by Compute Engine (not terminated
            by user). This configuration is identical to
            ``automaticRestart`` field in Compute Engine create instance
            under scheduling. It was changed to an enum (instead of a
            boolean) to match the default value in Compute Engine which
            is automatic restart.
        node_affinities (MutableSequence[google.events.cloud.vmmigration_v1.types.SchedulingNodeAffinity]):
            A set of node affinity and anti-affinity
            configurations for sole tenant nodes.
        min_node_cpus (int):
            The minimum number of virtual CPUs this instance will
            consume when running on a sole-tenant node. Ignored if no
            node_affinites are configured.
    """
    class OnHostMaintenance(proto.Enum):
        r"""

        Values:
            ON_HOST_MAINTENANCE_UNSPECIFIED (0):
                An unknown, unexpected behavior.
            TERMINATE (1):
                Terminate the instance when the host machine
                undergoes maintenance.
            MIGRATE (2):
                Migrate the instance when the host machine
                undergoes maintenance.
        """
        ON_HOST_MAINTENANCE_UNSPECIFIED = 0
        TERMINATE = 1
        MIGRATE = 2

    class RestartType(proto.Enum):
        r"""Defines whether the Instance should be automatically
        restarted whenever it is terminated by Compute Engine (not
        terminated by user).

        Values:
            RESTART_TYPE_UNSPECIFIED (0):
                Unspecified behavior. This will use the
                default.
            AUTOMATIC_RESTART (1):
                The Instance should be automatically
                restarted whenever it is terminated by Compute
                Engine.
            NO_AUTOMATIC_RESTART (2):
                The Instance isn't automatically restarted
                whenever it is terminated by Compute Engine.
        """
        RESTART_TYPE_UNSPECIFIED = 0
        AUTOMATIC_RESTART = 1
        NO_AUTOMATIC_RESTART = 2

    on_host_maintenance: OnHostMaintenance = proto.Field(
        proto.ENUM,
        number=1,
        enum=OnHostMaintenance,
    )
    restart_type: RestartType = proto.Field(
        proto.ENUM,
        number=5,
        enum=RestartType,
    )
    node_affinities: MutableSequence['SchedulingNodeAffinity'] = proto.RepeatedField(
        proto.MESSAGE,
        number=3,
        message='SchedulingNodeAffinity',
    )
    min_node_cpus: int = proto.Field(
        proto.INT32,
        number=4,
    )


class SchedulePolicy(proto.Message):
    r"""A policy for scheduling replications.

    Attributes:
        idle_duration (google.protobuf.duration_pb2.Duration):
            The idle duration between replication stages.
        skip_os_adaptation (bool):
            A flag to indicate whether to skip OS
            adaptation during the replication sync. OS
            adaptation is a process where the VM's operating
            system undergoes changes and adaptations to
            fully function on Compute Engine.
    """

    idle_duration: duration_pb2.Duration = proto.Field(
        proto.MESSAGE,
        number=1,
        message=duration_pb2.Duration,
    )
    skip_os_adaptation: bool = proto.Field(
        proto.BOOL,
        number=2,
    )


class TargetProject(proto.Message):
    r"""TargetProject message represents a target Compute Engine
    project for a migration or a clone.

    Attributes:
        name (str):
            Output only. The name of the target project.
        project (str):
            The target project ID (number) or project
            name.
        description (str):
            The target project's description.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time this target project
            resource was created (not related to when the
            Compute Engine project it points to was
            created).
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The last time the target project
            resource was updated.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    project: str = proto.Field(
        proto.STRING,
        number=2,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=5,
        message=timestamp_pb2.Timestamp,
    )


class Group(proto.Message):
    r"""Describes message for 'Group' resource. The Group is a
    collections of several MigratingVms.

    Attributes:
        name (str):
            Output only. The Group name.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The create time timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The update time timestamp.
        description (str):
            User-provided description of the group.
        display_name (str):
            Display name is a user defined name for this
            group which can be updated.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    description: str = proto.Field(
        proto.STRING,
        number=4,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=5,
    )


class MigrationWarning(proto.Message):
    r"""Represents migration resource warning information that can be
    used with google.rpc.Status message. MigrationWarning is used to
    present the user with warning information in migration
    operations.

    Attributes:
        code (google.events.cloud.vmmigration_v1.types.MigrationWarning.WarningCode):
            The warning code.
        warning_message (google.rpc.error_details_pb2.LocalizedMessage):
            The localized warning message.
        action_item (google.rpc.error_details_pb2.LocalizedMessage):
            Suggested action for solving the warning.
        help_links (MutableSequence[google.rpc.error_details_pb2.Link]):
            URL(s) pointing to additional information on
            handling the current warning.
        warning_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the warning occurred.
    """
    class WarningCode(proto.Enum):
        r"""Represents possible warning codes.

        Values:
            WARNING_CODE_UNSPECIFIED (0):
                Default value. This value is not used.
            ADAPTATION_WARNING (1):
                A warning originated from OS Adaptation.
        """
        WARNING_CODE_UNSPECIFIED = 0
        ADAPTATION_WARNING = 1

    code: WarningCode = proto.Field(
        proto.ENUM,
        number=1,
        enum=WarningCode,
    )
    warning_message: error_details_pb2.LocalizedMessage = proto.Field(
        proto.MESSAGE,
        number=2,
        message=error_details_pb2.LocalizedMessage,
    )
    action_item: error_details_pb2.LocalizedMessage = proto.Field(
        proto.MESSAGE,
        number=3,
        message=error_details_pb2.LocalizedMessage,
    )
    help_links: MutableSequence[error_details_pb2.Help.Link] = proto.RepeatedField(
        proto.MESSAGE,
        number=4,
        message=error_details_pb2.Help.Link,
    )
    warning_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=5,
        message=timestamp_pb2.Timestamp,
    )


class AwsSourceVmDetails(proto.Message):
    r"""Represent the source AWS VM details.

    Attributes:
        firmware (google.events.cloud.vmmigration_v1.types.AwsSourceVmDetails.Firmware):
            The firmware type of the source VM.
        committed_storage_bytes (int):
            The total size of the disks being migrated in
            bytes.
        disks (MutableSequence[google.events.cloud.vmmigration_v1.types.AwsSourceVmDetails.AwsDiskDetails]):
            The disks attached to the source VM.
    """
    class Firmware(proto.Enum):
        r"""Possible values for AWS VM firmware.

        Values:
            FIRMWARE_UNSPECIFIED (0):
                The firmware is unknown.
            EFI (1):
                The firmware is EFI.
            BIOS (2):
                The firmware is BIOS.
        """
        FIRMWARE_UNSPECIFIED = 0
        EFI = 1
        BIOS = 2

    class AwsDiskDetails(proto.Message):
        r"""The details of an AWS instance disk.

        Attributes:
            disk_number (int):
                The ordinal number of the disk.
            volume_id (str):
                AWS volume ID.
            size_gb (int):
                Size in GB.
        """

        disk_number: int = proto.Field(
            proto.INT32,
            number=1,
        )
        volume_id: str = proto.Field(
            proto.STRING,
            number=2,
        )
        size_gb: int = proto.Field(
            proto.INT64,
            number=3,
        )

    firmware: Firmware = proto.Field(
        proto.ENUM,
        number=1,
        enum=Firmware,
    )
    committed_storage_bytes: int = proto.Field(
        proto.INT64,
        number=2,
    )
    disks: MutableSequence[AwsDiskDetails] = proto.RepeatedField(
        proto.MESSAGE,
        number=3,
        message=AwsDiskDetails,
    )


class UtilizationReportEventData(proto.Message):
    r"""The data within all UtilizationReport events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.vmmigration_v1.types.UtilizationReport):
            Optional. The UtilizationReport event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'UtilizationReport' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='UtilizationReport',
    )


class GroupEventData(proto.Message):
    r"""The data within all Group events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.vmmigration_v1.types.Group):
            Optional. The Group event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Group' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Group',
    )


class CloneJobEventData(proto.Message):
    r"""The data within all CloneJob events.

    Attributes:
        payload (google.events.cloud.vmmigration_v1.types.CloneJob):
            The CloneJob event payload.
    """

    payload: 'CloneJob' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='CloneJob',
    )


class DatacenterConnectorEventData(proto.Message):
    r"""The data within all DatacenterConnector events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.vmmigration_v1.types.DatacenterConnector):
            Optional. The DatacenterConnector event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'DatacenterConnector' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='DatacenterConnector',
    )


class TargetProjectEventData(proto.Message):
    r"""The data within all TargetProject events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.vmmigration_v1.types.TargetProject):
            Optional. The TargetProject event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'TargetProject' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='TargetProject',
    )


class CutoverJobEventData(proto.Message):
    r"""The data within all CutoverJob events.

    Attributes:
        payload (google.events.cloud.vmmigration_v1.types.CutoverJob):
            The CutoverJob event payload.
    """

    payload: 'CutoverJob' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='CutoverJob',
    )


class SourceEventData(proto.Message):
    r"""The data within all Source events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.vmmigration_v1.types.Source):
            Optional. The Source event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Source' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Source',
    )


class MigratingVmEventData(proto.Message):
    r"""The data within all MigratingVm events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.vmmigration_v1.types.MigratingVm):
            Optional. The MigratingVm event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'MigratingVm' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='MigratingVm',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
