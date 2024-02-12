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

from google.protobuf import timestamp_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.notebooks.v1',
    manifest={
        'Environment',
        'VmImage',
        'ContainerImage',
        'Runtime',
        'RuntimeAcceleratorConfig',
        'EncryptionConfig',
        'LocalDisk',
        'LocalDiskInitializeParams',
        'RuntimeAccessConfig',
        'RuntimeSoftwareConfig',
        'RuntimeMetrics',
        'RuntimeShieldedInstanceConfig',
        'VirtualMachine',
        'VirtualMachineConfig',
        'ExecutionTemplate',
        'Execution',
        'ReservationAffinity',
        'Instance',
        'Schedule',
        'RuntimeEventData',
        'ExecutionEventData',
        'InstanceEventData',
        'ScheduleEventData',
        'EnvironmentEventData',
    },
)


class Environment(proto.Message):
    r"""Definition of a software environment that is used to start a
    notebook instance.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            Output only. Name of this environment. Format:
            ``projects/{project_id}/locations/{location}/environments/{environment_id}``
        display_name (str):
            Display name of this environment for the UI.
        description (str):
            A brief description of this environment.
        vm_image (google.events.cloud.notebooks_v1.types.VmImage):
            Use a Compute Engine VM image to start the
            notebook instance.

            This field is a member of `oneof`_ ``image_type``.
        container_image (google.events.cloud.notebooks_v1.types.ContainerImage):
            Use a container image to start the notebook
            instance.

            This field is a member of `oneof`_ ``image_type``.
        post_startup_script (str):
            Path to a Bash script that automatically runs after a
            notebook instance fully boots up. The path must be a URL or
            Cloud Storage path. Example:
            ``"gs://path-to-file/file-name"``
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time at which this
            environment was created.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    vm_image: 'VmImage' = proto.Field(
        proto.MESSAGE,
        number=6,
        oneof='image_type',
        message='VmImage',
    )
    container_image: 'ContainerImage' = proto.Field(
        proto.MESSAGE,
        number=7,
        oneof='image_type',
        message='ContainerImage',
    )
    post_startup_script: str = proto.Field(
        proto.STRING,
        number=8,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=9,
        message=timestamp_pb2.Timestamp,
    )


class VmImage(proto.Message):
    r"""Definition of a custom Compute Engine virtual machine image
    for starting a notebook instance with the environment installed
    directly on the VM.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        project (str):
            Required. The name of the Google Cloud project that this VM
            image belongs to. Format: ``{project_id}``
        image_name (str):
            Use VM image name to find the image.

            This field is a member of `oneof`_ ``image``.
        image_family (str):
            Use this VM image family to find the image;
            the newest image in this family will be used.

            This field is a member of `oneof`_ ``image``.
    """

    project: str = proto.Field(
        proto.STRING,
        number=1,
    )
    image_name: str = proto.Field(
        proto.STRING,
        number=2,
        oneof='image',
    )
    image_family: str = proto.Field(
        proto.STRING,
        number=3,
        oneof='image',
    )


class ContainerImage(proto.Message):
    r"""Definition of a container image for starting a notebook
    instance with the environment installed in a container.

    Attributes:
        repository (str):
            Required. The path to the container image repository. For
            example: ``gcr.io/{project_id}/{image_name}``
        tag (str):
            The tag of the container image. If not
            specified, this defaults to the latest tag.
    """

    repository: str = proto.Field(
        proto.STRING,
        number=1,
    )
    tag: str = proto.Field(
        proto.STRING,
        number=2,
    )


class Runtime(proto.Message):
    r"""The definition of a Runtime for a managed notebook instance.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            Output only. The resource name of the runtime. Format:
            ``projects/{project}/locations/{location}/runtimes/{runtimeId}``
        virtual_machine (google.events.cloud.notebooks_v1.types.VirtualMachine):
            Use a Compute Engine VM image to start the
            managed notebook instance.

            This field is a member of `oneof`_ ``runtime_type``.
        state (google.events.cloud.notebooks_v1.types.Runtime.State):
            Output only. Runtime state.
        health_state (google.events.cloud.notebooks_v1.types.Runtime.HealthState):
            Output only. Runtime health_state.
        access_config (google.events.cloud.notebooks_v1.types.RuntimeAccessConfig):
            The config settings for accessing runtime.
        software_config (google.events.cloud.notebooks_v1.types.RuntimeSoftwareConfig):
            The config settings for software inside the
            runtime.
        metrics (google.events.cloud.notebooks_v1.types.RuntimeMetrics):
            Output only. Contains Runtime daemon metrics
            such as Service status and JupyterLab stats.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Runtime creation time.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Runtime update time.
        labels (MutableMapping[str, str]):
            Optional. The labels to associate with this Managed Notebook
            or Runtime. Label **keys** must contain 1 to 63 characters,
            and must conform to `RFC
            1035 <https://www.ietf.org/rfc/rfc1035.txt>`__. Label
            **values** may be empty, but, if present, must contain 1 to
            63 characters, and must conform to `RFC
            1035 <https://www.ietf.org/rfc/rfc1035.txt>`__. No more than
            32 labels can be associated with a cluster.
    """
    class State(proto.Enum):
        r"""The definition of the states of this runtime.

        Values:
            STATE_UNSPECIFIED (0):
                State is not specified.
            STARTING (1):
                The compute layer is starting the runtime. It
                is not ready for use.
            PROVISIONING (2):
                The compute layer is installing required
                frameworks and registering the runtime with
                notebook proxy. It cannot be used.
            ACTIVE (3):
                The runtime is currently running. It is ready
                for use.
            STOPPING (4):
                The control logic is stopping the runtime. It
                cannot be used.
            STOPPED (5):
                The runtime is stopped. It cannot be used.
            DELETING (6):
                The runtime is being deleted. It cannot be
                used.
            UPGRADING (7):
                The runtime is upgrading. It cannot be used.
            INITIALIZING (8):
                The runtime is being created and set up. It
                is not ready for use.
        """
        STATE_UNSPECIFIED = 0
        STARTING = 1
        PROVISIONING = 2
        ACTIVE = 3
        STOPPING = 4
        STOPPED = 5
        DELETING = 6
        UPGRADING = 7
        INITIALIZING = 8

    class HealthState(proto.Enum):
        r"""The runtime substate.

        Values:
            HEALTH_STATE_UNSPECIFIED (0):
                The runtime substate is unknown.
            HEALTHY (1):
                The runtime is known to be in an healthy
                state (for example, critical daemons are
                running) Applies to ACTIVE state.
            UNHEALTHY (2):
                The runtime is known to be in an unhealthy
                state (for example, critical daemons are not
                running) Applies to ACTIVE state.
            AGENT_NOT_INSTALLED (3):
                The runtime has not installed health
                monitoring agent. Applies to ACTIVE state.
            AGENT_NOT_RUNNING (4):
                The runtime health monitoring agent is not
                running. Applies to ACTIVE state.
        """
        HEALTH_STATE_UNSPECIFIED = 0
        HEALTHY = 1
        UNHEALTHY = 2
        AGENT_NOT_INSTALLED = 3
        AGENT_NOT_RUNNING = 4

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    virtual_machine: 'VirtualMachine' = proto.Field(
        proto.MESSAGE,
        number=2,
        oneof='runtime_type',
        message='VirtualMachine',
    )
    state: State = proto.Field(
        proto.ENUM,
        number=3,
        enum=State,
    )
    health_state: HealthState = proto.Field(
        proto.ENUM,
        number=4,
        enum=HealthState,
    )
    access_config: 'RuntimeAccessConfig' = proto.Field(
        proto.MESSAGE,
        number=5,
        message='RuntimeAccessConfig',
    )
    software_config: 'RuntimeSoftwareConfig' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='RuntimeSoftwareConfig',
    )
    metrics: 'RuntimeMetrics' = proto.Field(
        proto.MESSAGE,
        number=7,
        message='RuntimeMetrics',
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=20,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=21,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=23,
    )


class RuntimeAcceleratorConfig(proto.Message):
    r"""Definition of the types of hardware accelerators that can be used.
    Definition of the types of hardware accelerators that can be used.
    See `Compute Engine
    AcceleratorTypes <https://cloud.google.com/compute/docs/reference/beta/acceleratorTypes>`__.
    Examples:

    -  ``nvidia-tesla-k80``
    -  ``nvidia-tesla-p100``
    -  ``nvidia-tesla-v100``
    -  ``nvidia-tesla-p4``
    -  ``nvidia-tesla-t4``
    -  ``nvidia-tesla-a100``

    Attributes:
        type_ (google.events.cloud.notebooks_v1.types.RuntimeAcceleratorConfig.AcceleratorType):
            Accelerator model.
        core_count (int):
            Count of cores of this accelerator.
    """
    class AcceleratorType(proto.Enum):
        r"""Type of this accelerator.

        Values:
            ACCELERATOR_TYPE_UNSPECIFIED (0):
                Accelerator type is not specified.
            NVIDIA_TESLA_K80 (1):
                Accelerator type is Nvidia Tesla K80.
            NVIDIA_TESLA_P100 (2):
                Accelerator type is Nvidia Tesla P100.
            NVIDIA_TESLA_V100 (3):
                Accelerator type is Nvidia Tesla V100.
            NVIDIA_TESLA_P4 (4):
                Accelerator type is Nvidia Tesla P4.
            NVIDIA_TESLA_T4 (5):
                Accelerator type is Nvidia Tesla T4.
            NVIDIA_TESLA_A100 (6):
                Accelerator type is Nvidia Tesla A100 - 40GB.
            TPU_V2 (7):
                (Coming soon) Accelerator type is TPU V2.
            TPU_V3 (8):
                (Coming soon) Accelerator type is TPU V3.
            NVIDIA_TESLA_T4_VWS (9):
                Accelerator type is NVIDIA Tesla T4 Virtual
                Workstations.
            NVIDIA_TESLA_P100_VWS (10):
                Accelerator type is NVIDIA Tesla P100 Virtual
                Workstations.
            NVIDIA_TESLA_P4_VWS (11):
                Accelerator type is NVIDIA Tesla P4 Virtual
                Workstations.
        """
        ACCELERATOR_TYPE_UNSPECIFIED = 0
        NVIDIA_TESLA_K80 = 1
        NVIDIA_TESLA_P100 = 2
        NVIDIA_TESLA_V100 = 3
        NVIDIA_TESLA_P4 = 4
        NVIDIA_TESLA_T4 = 5
        NVIDIA_TESLA_A100 = 6
        TPU_V2 = 7
        TPU_V3 = 8
        NVIDIA_TESLA_T4_VWS = 9
        NVIDIA_TESLA_P100_VWS = 10
        NVIDIA_TESLA_P4_VWS = 11

    type_: AcceleratorType = proto.Field(
        proto.ENUM,
        number=1,
        enum=AcceleratorType,
    )
    core_count: int = proto.Field(
        proto.INT64,
        number=2,
    )


class EncryptionConfig(proto.Message):
    r"""Represents a custom encryption key configuration that can be
    applied to a resource. This will encrypt all disks in Virtual
    Machine.

    Attributes:
        kms_key (str):
            The Cloud KMS resource identifier of the customer-managed
            encryption key used to protect a resource, such as a disks.
            It has the following format:
            ``projects/{PROJECT_ID}/locations/{REGION}/keyRings/{KEY_RING_NAME}/cryptoKeys/{KEY_NAME}``
    """

    kms_key: str = proto.Field(
        proto.STRING,
        number=1,
    )


class LocalDisk(proto.Message):
    r"""A Local attached disk resource.

    Attributes:
        auto_delete (bool):
            Optional. Output only. Specifies whether the
            disk will be auto-deleted when the instance is
            deleted (but not when the disk is detached from
            the instance).
        boot (bool):
            Optional. Output only. Indicates that this is
            a boot disk. The virtual machine will use the
            first partition of the disk for its root
            filesystem.
        device_name (str):
            Optional. Output only. Specifies a unique device name of
            your choice that is reflected into the
            ``/dev/disk/by-id/google-*`` tree of a Linux operating
            system running within the instance. This name can be used to
            reference the device for mounting, resizing, and so on, from
            within the instance.

            If not specified, the server chooses a default device name
            to apply to this disk, in the form persistent-disk-x, where
            x is a number assigned by Google Compute Engine. This field
            is only applicable for persistent disks.
        guest_os_features (MutableSequence[google.events.cloud.notebooks_v1.types.LocalDisk.RuntimeGuestOsFeature]):
            Output only. Indicates a list of features to
            enable on the guest operating system. Applicable
            only for bootable images. Read  Enabling guest
            operating system features to see a list of
            available options.
        index (int):
            Output only. A zero-based index to this disk,
            where 0 is reserved for the boot disk. If you
            have many disks attached to an instance, each
            disk would have a unique index number.
        interface (str):
            Specifies the disk interface to use for attaching this disk,
            which is either SCSI or NVME. The default is SCSI.
            Persistent disks must always use SCSI and the request will
            fail if you attempt to attach a persistent disk in any other
            format than SCSI. Local SSDs can use either NVME or SCSI.
            For performance characteristics of SCSI over NVMe, see Local
            SSD performance. Valid values:

            -  ``NVME``
            -  ``SCSI``
        kind (str):
            Output only. Type of the resource. Always
            compute#attachedDisk for attached disks.
        licenses (MutableSequence[str]):
            Output only. Any valid publicly visible
            licenses.
        mode (str):
            The mode in which to attach this disk, either ``READ_WRITE``
            or ``READ_ONLY``. If not specified, the default is to attach
            the disk in ``READ_WRITE`` mode. Valid values:

            -  ``READ_ONLY``
            -  ``READ_WRITE``
        source (str):
            Specifies a valid partial or full URL to an
            existing Persistent Disk resource.
        type_ (str):
            Specifies the type of the disk, either ``SCRATCH`` or
            ``PERSISTENT``. If not specified, the default is
            ``PERSISTENT``. Valid values:

            -  ``PERSISTENT``
            -  ``SCRATCH``
    """

    class RuntimeGuestOsFeature(proto.Message):
        r"""Optional. A list of features to enable on the guest operating
        system. Applicable only for bootable images. Read `Enabling guest
        operating system
        features <https://cloud.google.com/compute/docs/images/create-delete-deprecate-private-images#guest-os-features>`__
        to see a list of available options. Guest OS features for boot disk.

        Attributes:
            type_ (str):
                The ID of a supported feature. Read `Enabling guest
                operating system
                features <https://cloud.google.com/compute/docs/images/create-delete-deprecate-private-images#guest-os-features>`__
                to see a list of available options.

                Valid values:

                -  ``FEATURE_TYPE_UNSPECIFIED``
                -  ``MULTI_IP_SUBNET``
                -  ``SECURE_BOOT``
                -  ``UEFI_COMPATIBLE``
                -  ``VIRTIO_SCSI_MULTIQUEUE``
                -  ``WINDOWS``
        """

        type_: str = proto.Field(
            proto.STRING,
            number=1,
        )

    auto_delete: bool = proto.Field(
        proto.BOOL,
        number=1,
    )
    boot: bool = proto.Field(
        proto.BOOL,
        number=2,
    )
    device_name: str = proto.Field(
        proto.STRING,
        number=3,
    )
    guest_os_features: MutableSequence[RuntimeGuestOsFeature] = proto.RepeatedField(
        proto.MESSAGE,
        number=4,
        message=RuntimeGuestOsFeature,
    )
    index: int = proto.Field(
        proto.INT32,
        number=5,
    )
    interface: str = proto.Field(
        proto.STRING,
        number=7,
    )
    kind: str = proto.Field(
        proto.STRING,
        number=8,
    )
    licenses: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=9,
    )
    mode: str = proto.Field(
        proto.STRING,
        number=10,
    )
    source: str = proto.Field(
        proto.STRING,
        number=11,
    )
    type_: str = proto.Field(
        proto.STRING,
        number=12,
    )


class LocalDiskInitializeParams(proto.Message):
    r"""Input only. Specifies the parameters for a new disk that will
    be created alongside the new instance. Use initialization
    parameters to create boot disks or local SSDs attached to the
    new runtime.
    This property is mutually exclusive with the source property;
    you can only define one or the other, but not both.

    Attributes:
        description (str):
            Optional. Provide this property when creating
            the disk.
        disk_name (str):
            Optional. Specifies the disk name. If not
            specified, the default is to use the name of the
            instance. If the disk with the instance name
            exists already in the given zone/region, a new
            name will be automatically generated.
        disk_size_gb (int):
            Optional. Specifies the size of the disk in
            base-2 GB. If not specified, the disk will be
            the same size as the image (usually 10GB). If
            specified, the size must be equal to or larger
            than 10GB. Default 100 GB.
        labels (MutableMapping[str, str]):
            Optional. Labels to apply to this disk. These
            can be later modified by the disks.setLabels
            method. This field is only applicable for
            persistent disks.
    """
    class DiskType(proto.Enum):
        r"""Possible disk types.

        Values:
            DISK_TYPE_UNSPECIFIED (0):
                Disk type not set.
            PD_STANDARD (1):
                Standard persistent disk type.
            PD_SSD (2):
                SSD persistent disk type.
            PD_BALANCED (3):
                Balanced persistent disk type.
            PD_EXTREME (4):
                Extreme persistent disk type.
        """
        DISK_TYPE_UNSPECIFIED = 0
        PD_STANDARD = 1
        PD_SSD = 2
        PD_BALANCED = 3
        PD_EXTREME = 4

    description: str = proto.Field(
        proto.STRING,
        number=1,
    )
    disk_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    disk_size_gb: int = proto.Field(
        proto.INT64,
        number=3,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=5,
    )


class RuntimeAccessConfig(proto.Message):
    r"""Specifies the login configuration for Runtime

    Attributes:
        access_type (google.events.cloud.notebooks_v1.types.RuntimeAccessConfig.RuntimeAccessType):
            The type of access mode this instance.
        runtime_owner (str):
            The owner of this runtime after creation. Format:
            ``alias@example.com`` Currently supports one owner only.
        proxy_uri (str):
            Output only. The proxy endpoint that is used
            to access the runtime.
    """
    class RuntimeAccessType(proto.Enum):
        r"""Possible ways to access runtime. Authentication mode.
        Currently supports: Single User only.

        Values:
            RUNTIME_ACCESS_TYPE_UNSPECIFIED (0):
                Unspecified access.
            SINGLE_USER (1):
                Single user login.
            SERVICE_ACCOUNT (2):
                Service Account mode.
                In Service Account mode, Runtime creator will
                specify a SA that exists in the consumer
                project. Using Runtime Service Account field.
                Users accessing the Runtime need ActAs (Service
                Account User) permission.
        """
        RUNTIME_ACCESS_TYPE_UNSPECIFIED = 0
        SINGLE_USER = 1
        SERVICE_ACCOUNT = 2

    access_type: RuntimeAccessType = proto.Field(
        proto.ENUM,
        number=1,
        enum=RuntimeAccessType,
    )
    runtime_owner: str = proto.Field(
        proto.STRING,
        number=2,
    )
    proxy_uri: str = proto.Field(
        proto.STRING,
        number=3,
    )


class RuntimeSoftwareConfig(proto.Message):
    r"""Specifies the selection and configuration of software inside the
    runtime. The properties to set on runtime. Properties keys are
    specified in ``key:value`` format, for example:

    -  ``idle_shutdown: true``
    -  ``idle_shutdown_timeout: 180``
    -  ``enable_health_monitoring: true``


    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        notebook_upgrade_schedule (str):
            Cron expression in UTC timezone, used to schedule instance
            auto upgrade. Please follow the `cron
            format <https://en.wikipedia.org/wiki/Cron>`__.
        enable_health_monitoring (bool):
            Verifies core internal services are running.
            Default: True

            This field is a member of `oneof`_ ``_enable_health_monitoring``.
        idle_shutdown (bool):
            Runtime will automatically shutdown after
            idle_shutdown_time. Default: True

            This field is a member of `oneof`_ ``_idle_shutdown``.
        idle_shutdown_timeout (int):
            Time in minutes to wait before shutting down
            runtime. Default: 180 minutes
        install_gpu_driver (bool):
            Install Nvidia Driver automatically.
            Default: True
        custom_gpu_driver_path (str):
            Specify a custom Cloud Storage path where the
            GPU driver is stored. If not specified, we'll
            automatically choose from official GPU drivers.
        post_startup_script (str):
            Path to a Bash script that automatically runs after a
            notebook instance fully boots up. The path must be a URL or
            Cloud Storage path (``gs://path-to-file/file-name``).
        kernels (MutableSequence[google.events.cloud.notebooks_v1.types.ContainerImage]):
            Optional. Use a list of container images to
            use as Kernels in the notebook instance.
        upgradeable (bool):
            Output only. Bool indicating whether an newer
            image is available in an image family.

            This field is a member of `oneof`_ ``_upgradeable``.
        post_startup_script_behavior (google.events.cloud.notebooks_v1.types.RuntimeSoftwareConfig.PostStartupScriptBehavior):
            Behavior for the post startup script.
        disable_terminal (bool):
            Bool indicating whether JupyterLab terminal
            will be available or not. Default: False

            This field is a member of `oneof`_ ``_disable_terminal``.
        version (str):
            Output only. version of boot image such as
            M100, from release label of the image.

            This field is a member of `oneof`_ ``_version``.
        mixer_disabled (bool):
            Bool indicating whether mixer client should
            be disabled. Default: False

            This field is a member of `oneof`_ ``_mixer_disabled``.
    """
    class PostStartupScriptBehavior(proto.Enum):
        r"""Behavior for the post startup script.

        Values:
            POST_STARTUP_SCRIPT_BEHAVIOR_UNSPECIFIED (0):
                Unspecified post startup script behavior.
                Will run only once at creation.
            RUN_EVERY_START (1):
                Runs the post startup script provided during
                creation at every start.
            DOWNLOAD_AND_RUN_EVERY_START (2):
                Downloads and runs the provided post startup
                script at every start.
        """
        POST_STARTUP_SCRIPT_BEHAVIOR_UNSPECIFIED = 0
        RUN_EVERY_START = 1
        DOWNLOAD_AND_RUN_EVERY_START = 2

    notebook_upgrade_schedule: str = proto.Field(
        proto.STRING,
        number=1,
    )
    enable_health_monitoring: bool = proto.Field(
        proto.BOOL,
        number=2,
        optional=True,
    )
    idle_shutdown: bool = proto.Field(
        proto.BOOL,
        number=3,
        optional=True,
    )
    idle_shutdown_timeout: int = proto.Field(
        proto.INT32,
        number=4,
    )
    install_gpu_driver: bool = proto.Field(
        proto.BOOL,
        number=5,
    )
    custom_gpu_driver_path: str = proto.Field(
        proto.STRING,
        number=6,
    )
    post_startup_script: str = proto.Field(
        proto.STRING,
        number=7,
    )
    kernels: MutableSequence['ContainerImage'] = proto.RepeatedField(
        proto.MESSAGE,
        number=8,
        message='ContainerImage',
    )
    upgradeable: bool = proto.Field(
        proto.BOOL,
        number=9,
        optional=True,
    )
    post_startup_script_behavior: PostStartupScriptBehavior = proto.Field(
        proto.ENUM,
        number=10,
        enum=PostStartupScriptBehavior,
    )
    disable_terminal: bool = proto.Field(
        proto.BOOL,
        number=11,
        optional=True,
    )
    version: str = proto.Field(
        proto.STRING,
        number=12,
        optional=True,
    )
    mixer_disabled: bool = proto.Field(
        proto.BOOL,
        number=13,
        optional=True,
    )


class RuntimeMetrics(proto.Message):
    r"""Contains runtime daemon metrics, such as OS and kernels and
    sessions stats.

    Attributes:
        system_metrics (MutableMapping[str, str]):
            Output only. The system metrics.
    """

    system_metrics: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=1,
    )


class RuntimeShieldedInstanceConfig(proto.Message):
    r"""A set of Shielded Instance options. See `Images using supported
    Shielded VM
    features <https://cloud.google.com/compute/docs/instances/modifying-shielded-vm>`__.
    Not all combinations are valid.

    Attributes:
        enable_secure_boot (bool):
            Defines whether the instance has Secure Boot
            enabled.
            Secure Boot helps ensure that the system only
            runs authentic software by verifying the digital
            signature of all boot components, and halting
            the boot process if signature verification
            fails. Disabled by default.
        enable_vtpm (bool):
            Defines whether the instance has the vTPM
            enabled. Enabled by default.
        enable_integrity_monitoring (bool):
            Defines whether the instance has integrity
            monitoring enabled.
            Enables monitoring and attestation of the boot
            integrity of the instance. The attestation is
            performed against the integrity policy baseline.
            This baseline is initially derived from the
            implicitly trusted boot image when the instance
            is created. Enabled by default.
    """

    enable_secure_boot: bool = proto.Field(
        proto.BOOL,
        number=1,
    )
    enable_vtpm: bool = proto.Field(
        proto.BOOL,
        number=2,
    )
    enable_integrity_monitoring: bool = proto.Field(
        proto.BOOL,
        number=3,
    )


class VirtualMachine(proto.Message):
    r"""Runtime using Virtual Machine for computing.

    Attributes:
        instance_name (str):
            Output only. The user-friendly name of the
            Managed Compute Engine instance.
        instance_id (str):
            Output only. The unique identifier of the
            Managed Compute Engine instance.
        virtual_machine_config (google.events.cloud.notebooks_v1.types.VirtualMachineConfig):
            Virtual Machine configuration settings.
    """

    instance_name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    instance_id: str = proto.Field(
        proto.STRING,
        number=2,
    )
    virtual_machine_config: 'VirtualMachineConfig' = proto.Field(
        proto.MESSAGE,
        number=3,
        message='VirtualMachineConfig',
    )


class VirtualMachineConfig(proto.Message):
    r"""The config settings for virtual machine.

    Attributes:
        zone (str):
            Output only. The zone where the virtual machine is located.
            If using regional request, the notebooks service will pick a
            location in the corresponding runtime region. On a get
            request, zone will always be present. Example:

            -  ``us-central1-b``
        machine_type (str):
            Required. The Compute Engine machine type used for runtimes.
            Short name is valid. Examples:

            -  ``n1-standard-2``
            -  ``e2-standard-8``
        container_images (MutableSequence[google.events.cloud.notebooks_v1.types.ContainerImage]):
            Optional. Use a list of container images to
            use as Kernels in the notebook instance.
        data_disk (google.events.cloud.notebooks_v1.types.LocalDisk):
            Required. Data disk option configuration
            settings.
        encryption_config (google.events.cloud.notebooks_v1.types.EncryptionConfig):
            Optional. Encryption settings for virtual
            machine data disk.
        shielded_instance_config (google.events.cloud.notebooks_v1.types.RuntimeShieldedInstanceConfig):
            Optional. Shielded VM Instance configuration
            settings.
        accelerator_config (google.events.cloud.notebooks_v1.types.RuntimeAcceleratorConfig):
            Optional. The Compute Engine accelerator
            configuration for this runtime.
        network (str):
            Optional. The Compute Engine network to be used for machine
            communications. Cannot be specified with subnetwork. If
            neither ``network`` nor ``subnet`` is specified, the
            "default" network of the project is used, if it exists.

            A full URL or partial URI. Examples:

            -  ``https://www.googleapis.com/compute/v1/projects/[project_id]/global/networks/default``
            -  ``projects/[project_id]/global/networks/default``

            Runtimes are managed resources inside Google Infrastructure.
            Runtimes support the following network configurations:

            -  Google Managed Network (Network & subnet are empty)
            -  Consumer Project VPC (network & subnet are required).
               Requires configuring Private Service Access.
            -  Shared VPC (network & subnet are required). Requires
               configuring Private Service Access.
        subnet (str):
            Optional. The Compute Engine subnetwork to be used for
            machine communications. Cannot be specified with network.

            A full URL or partial URI are valid. Examples:

            -  ``https://www.googleapis.com/compute/v1/projects/[project_id]/regions/us-east1/subnetworks/sub0``
            -  ``projects/[project_id]/regions/us-east1/subnetworks/sub0``
        internal_ip_only (bool):
            Optional. If true, runtime will only have internal IP
            addresses. By default, runtimes are not restricted to
            internal IP addresses, and will have ephemeral external IP
            addresses assigned to each vm. This ``internal_ip_only``
            restriction can only be enabled for subnetwork enabled
            networks, and all dependencies must be configured to be
            accessible without external IP addresses.
        tags (MutableSequence[str]):
            Optional. The Compute Engine tags to add to runtime (see
            `Tagging
            instances <https://cloud.google.com/compute/docs/label-or-tag-resources#tags>`__).
        guest_attributes (MutableMapping[str, str]):
            Output only. The Compute Engine guest attributes. (see
            `Project and instance guest
            attributes <https://cloud.google.com/compute/docs/storing-retrieving-metadata#guest_attributes>`__).
        metadata (MutableMapping[str, str]):
            Optional. The Compute Engine metadata entries to add to
            virtual machine. (see `Project and instance
            metadata <https://cloud.google.com/compute/docs/storing-retrieving-metadata#project_and_instance_metadata>`__).
        labels (MutableMapping[str, str]):
            Optional. The labels to associate with this runtime. Label
            **keys** must contain 1 to 63 characters, and must conform
            to `RFC 1035 <https://www.ietf.org/rfc/rfc1035.txt>`__.
            Label **values** may be empty, but, if present, must contain
            1 to 63 characters, and must conform to `RFC
            1035 <https://www.ietf.org/rfc/rfc1035.txt>`__. No more than
            32 labels can be associated with a cluster.
        nic_type (google.events.cloud.notebooks_v1.types.VirtualMachineConfig.NicType):
            Optional. The type of vNIC to be used on this
            interface. This may be gVNIC or VirtioNet.
        reserved_ip_range (str):
            Optional. Reserved IP Range name is used for VPC Peering.
            The subnetwork allocation will use the range *name* if it's
            assigned.

            Example: managed-notebooks-range-c

            ::

                PEERING_RANGE_NAME_3=managed-notebooks-range-c
                gcloud compute addresses create $PEERING_RANGE_NAME_3 \
                  --global \
                  --prefix-length=24 \
                  --description="Google Cloud Managed Notebooks Range 24 c" \
                  --network=$NETWORK \
                  --addresses=192.168.0.0 \
                  --purpose=VPC_PEERING

            Field value will be: ``managed-notebooks-range-c``
        boot_image (google.events.cloud.notebooks_v1.types.VirtualMachineConfig.BootImage):
            Optional. Boot image metadata used for
            runtime upgradeability.
    """
    class NicType(proto.Enum):
        r"""The type of vNIC driver. Default should be UNSPECIFIED_NIC_TYPE.

        Values:
            UNSPECIFIED_NIC_TYPE (0):
                No type specified.
            VIRTIO_NET (1):
                VIRTIO
            GVNIC (2):
                GVNIC
        """
        UNSPECIFIED_NIC_TYPE = 0
        VIRTIO_NET = 1
        GVNIC = 2

    class BootImage(proto.Message):
        r"""Definition of the boot image used by the Runtime.
        Used to facilitate runtime upgradeability.

        """

    zone: str = proto.Field(
        proto.STRING,
        number=1,
    )
    machine_type: str = proto.Field(
        proto.STRING,
        number=2,
    )
    container_images: MutableSequence['ContainerImage'] = proto.RepeatedField(
        proto.MESSAGE,
        number=3,
        message='ContainerImage',
    )
    data_disk: 'LocalDisk' = proto.Field(
        proto.MESSAGE,
        number=4,
        message='LocalDisk',
    )
    encryption_config: 'EncryptionConfig' = proto.Field(
        proto.MESSAGE,
        number=5,
        message='EncryptionConfig',
    )
    shielded_instance_config: 'RuntimeShieldedInstanceConfig' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='RuntimeShieldedInstanceConfig',
    )
    accelerator_config: 'RuntimeAcceleratorConfig' = proto.Field(
        proto.MESSAGE,
        number=7,
        message='RuntimeAcceleratorConfig',
    )
    network: str = proto.Field(
        proto.STRING,
        number=8,
    )
    subnet: str = proto.Field(
        proto.STRING,
        number=9,
    )
    internal_ip_only: bool = proto.Field(
        proto.BOOL,
        number=10,
    )
    tags: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=13,
    )
    guest_attributes: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=14,
    )
    metadata: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=15,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=16,
    )
    nic_type: NicType = proto.Field(
        proto.ENUM,
        number=17,
        enum=NicType,
    )
    reserved_ip_range: str = proto.Field(
        proto.STRING,
        number=18,
    )
    boot_image: BootImage = proto.Field(
        proto.MESSAGE,
        number=19,
        message=BootImage,
    )


class ExecutionTemplate(proto.Message):
    r"""The description a notebook execution workload.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        scale_tier (google.events.cloud.notebooks_v1.types.ExecutionTemplate.ScaleTier):
            Required. Scale tier of the hardware used for
            notebook execution. DEPRECATED Will be
            discontinued. As right now only CUSTOM is
            supported.
        master_type (str):
            Specifies the type of virtual machine to use for your
            training job's master worker. You must specify this field
            when ``scaleTier`` is set to ``CUSTOM``.

            You can use certain Compute Engine machine types directly in
            this field. The following types are supported:

            -  ``n1-standard-4``
            -  ``n1-standard-8``
            -  ``n1-standard-16``
            -  ``n1-standard-32``
            -  ``n1-standard-64``
            -  ``n1-standard-96``
            -  ``n1-highmem-2``
            -  ``n1-highmem-4``
            -  ``n1-highmem-8``
            -  ``n1-highmem-16``
            -  ``n1-highmem-32``
            -  ``n1-highmem-64``
            -  ``n1-highmem-96``
            -  ``n1-highcpu-16``
            -  ``n1-highcpu-32``
            -  ``n1-highcpu-64``
            -  ``n1-highcpu-96``

            Alternatively, you can use the following legacy machine
            types:

            -  ``standard``
            -  ``large_model``
            -  ``complex_model_s``
            -  ``complex_model_m``
            -  ``complex_model_l``
            -  ``standard_gpu``
            -  ``complex_model_m_gpu``
            -  ``complex_model_l_gpu``
            -  ``standard_p100``
            -  ``complex_model_m_p100``
            -  ``standard_v100``
            -  ``large_model_v100``
            -  ``complex_model_m_v100``
            -  ``complex_model_l_v100``

            Finally, if you want to use a TPU for training, specify
            ``cloud_tpu`` in this field. Learn more about the `special
            configuration options for training with
            TPU <https://cloud.google.com/ai-platform/training/docs/using-tpus#configuring_a_custom_tpu_machine>`__.
        accelerator_config (google.events.cloud.notebooks_v1.types.ExecutionTemplate.SchedulerAcceleratorConfig):
            Configuration (count and accelerator type)
            for hardware running notebook execution.
        labels (MutableMapping[str, str]):
            Labels for execution.
            If execution is scheduled, a field included will
            be 'nbs-scheduled'. Otherwise, it is an
            immediate execution, and an included field will
            be 'nbs-immediate'. Use fields to efficiently
            index between various types of executions.
        input_notebook_file (str):
            Path to the notebook file to execute. Must be in a Google
            Cloud Storage bucket. Format:
            ``gs://{bucket_name}/{folder}/{notebook_file_name}`` Ex:
            ``gs://notebook_user/scheduled_notebooks/sentiment_notebook.ipynb``
        container_image_uri (str):
            Container Image URI to a DLVM
            Example:
            'gcr.io/deeplearning-platform-release/base-cu100'
            More examples can be found at:

            https://cloud.google.com/ai-platform/deep-learning-containers/docs/choosing-container
        output_notebook_folder (str):
            Path to the notebook folder to write to. Must be in a Google
            Cloud Storage bucket path. Format:
            ``gs://{bucket_name}/{folder}`` Ex:
            ``gs://notebook_user/scheduled_notebooks``
        params_yaml_file (str):
            Parameters to be overridden in the notebook during
            execution. Ref
            https://papermill.readthedocs.io/en/latest/usage-parameterize.html
            on how to specifying parameters in the input notebook and
            pass them here in an YAML file. Ex:
            ``gs://notebook_user/scheduled_notebooks/sentiment_notebook_params.yaml``
        parameters (str):
            Parameters used within the 'input_notebook_file' notebook.
        service_account (str):
            The email address of a service account to use when running
            the execution. You must have the
            ``iam.serviceAccounts.actAs`` permission for the specified
            service account.
        job_type (google.events.cloud.notebooks_v1.types.ExecutionTemplate.JobType):
            The type of Job to be used on this execution.
        dataproc_parameters (google.events.cloud.notebooks_v1.types.ExecutionTemplate.DataprocParameters):
            Parameters used in Dataproc JobType
            executions.

            This field is a member of `oneof`_ ``job_parameters``.
        vertex_ai_parameters (google.events.cloud.notebooks_v1.types.ExecutionTemplate.VertexAIParameters):
            Parameters used in Vertex AI JobType
            executions.

            This field is a member of `oneof`_ ``job_parameters``.
        kernel_spec (str):
            Name of the kernel spec to use. This must be
            specified if the kernel spec name on the
            execution target does not match the name in the
            input notebook file.
        tensorboard (str):
            The name of a Vertex AI [Tensorboard] resource to which this
            execution will upload Tensorboard logs. Format:
            ``projects/{project}/locations/{location}/tensorboards/{tensorboard}``
    """
    class ScaleTier(proto.Enum):
        r"""Required. Specifies the machine types, the number of replicas
        for workers and parameter servers.

        Values:
            SCALE_TIER_UNSPECIFIED (0):
                Unspecified Scale Tier.
            BASIC (1):
                A single worker instance. This tier is
                suitable for learning how to use Cloud ML, and
                for experimenting with new models using small
                datasets.
            STANDARD_1 (2):
                Many workers and a few parameter servers.
            PREMIUM_1 (3):
                A large number of workers with many parameter
                servers.
            BASIC_GPU (4):
                A single worker instance with a K80 GPU.
            BASIC_TPU (5):
                A single worker instance with a Cloud TPU.
            CUSTOM (6):
                The CUSTOM tier is not a set tier, but rather enables you to
                use your own cluster specification. When you use this tier,
                set values to configure your processing cluster according to
                these guidelines:

                -  You *must* set ``ExecutionTemplate.masterType`` to
                   specify the type of machine to use for your master node.
                   This is the only required setting.
        """
        SCALE_TIER_UNSPECIFIED = 0
        BASIC = 1
        STANDARD_1 = 2
        PREMIUM_1 = 3
        BASIC_GPU = 4
        BASIC_TPU = 5
        CUSTOM = 6

    class SchedulerAcceleratorType(proto.Enum):
        r"""Hardware accelerator types for AI Platform Training jobs.

        Values:
            SCHEDULER_ACCELERATOR_TYPE_UNSPECIFIED (0):
                Unspecified accelerator type. Default to no
                GPU.
            NVIDIA_TESLA_K80 (1):
                Nvidia Tesla K80 GPU.
            NVIDIA_TESLA_P100 (2):
                Nvidia Tesla P100 GPU.
            NVIDIA_TESLA_V100 (3):
                Nvidia Tesla V100 GPU.
            NVIDIA_TESLA_P4 (4):
                Nvidia Tesla P4 GPU.
            NVIDIA_TESLA_T4 (5):
                Nvidia Tesla T4 GPU.
            NVIDIA_TESLA_A100 (10):
                Nvidia Tesla A100 GPU.
            TPU_V2 (6):
                TPU v2.
            TPU_V3 (7):
                TPU v3.
        """
        SCHEDULER_ACCELERATOR_TYPE_UNSPECIFIED = 0
        NVIDIA_TESLA_K80 = 1
        NVIDIA_TESLA_P100 = 2
        NVIDIA_TESLA_V100 = 3
        NVIDIA_TESLA_P4 = 4
        NVIDIA_TESLA_T4 = 5
        NVIDIA_TESLA_A100 = 10
        TPU_V2 = 6
        TPU_V3 = 7

    class JobType(proto.Enum):
        r"""The backend used for this execution.

        Values:
            JOB_TYPE_UNSPECIFIED (0):
                No type specified.
            VERTEX_AI (1):
                Custom Job in ``aiplatform.googleapis.com``. Default value
                for an execution.
            DATAPROC (2):
                Run execution on a cluster with Dataproc as a
                job.
                https://cloud.google.com/dataproc/docs/reference/rest/v1/projects.regions.jobs
        """
        JOB_TYPE_UNSPECIFIED = 0
        VERTEX_AI = 1
        DATAPROC = 2

    class SchedulerAcceleratorConfig(proto.Message):
        r"""Definition of a hardware accelerator. Note that not all combinations
        of ``type`` and ``core_count`` are valid. See `GPUs on Compute
        Engine <https://cloud.google.com/compute/docs/gpus>`__ to find a
        valid combination. TPUs are not supported.

        Attributes:
            type_ (google.events.cloud.notebooks_v1.types.ExecutionTemplate.SchedulerAcceleratorType):
                Type of this accelerator.
            core_count (int):
                Count of cores of this accelerator.
        """

        type_: 'ExecutionTemplate.SchedulerAcceleratorType' = proto.Field(
            proto.ENUM,
            number=1,
            enum='ExecutionTemplate.SchedulerAcceleratorType',
        )
        core_count: int = proto.Field(
            proto.INT64,
            number=2,
        )

    class DataprocParameters(proto.Message):
        r"""Parameters used in Dataproc JobType executions.

        Attributes:
            cluster (str):
                URI for cluster used to run Dataproc execution. Format:
                ``projects/{PROJECT_ID}/regions/{REGION}/clusters/{CLUSTER_NAME}``
        """

        cluster: str = proto.Field(
            proto.STRING,
            number=1,
        )

    class VertexAIParameters(proto.Message):
        r"""Parameters used in Vertex AI JobType executions.

        Attributes:
            network (str):
                The full name of the Compute Engine
                `network <https://cloud.google.com/compute/docs/networks-and-firewalls#networks>`__
                to which the Job should be peered. For example,
                ``projects/12345/global/networks/myVPC``.
                `Format <https://cloud.google.com/compute/docs/reference/rest/v1/networks/insert>`__
                is of the form
                ``projects/{project}/global/networks/{network}``. Where
                ``{project}`` is a project number, as in ``12345``, and
                ``{network}`` is a network name.

                Private services access must already be configured for the
                network. If left unspecified, the job is not peered with any
                network.
            env (MutableMapping[str, str]):
                Environment variables. At most 100 environment variables can
                be specified and unique. Example:
                ``GCP_BUCKET=gs://my-bucket/samples/``
        """

        network: str = proto.Field(
            proto.STRING,
            number=1,
        )
        env: MutableMapping[str, str] = proto.MapField(
            proto.STRING,
            proto.STRING,
            number=2,
        )

    scale_tier: ScaleTier = proto.Field(
        proto.ENUM,
        number=1,
        enum=ScaleTier,
    )
    master_type: str = proto.Field(
        proto.STRING,
        number=2,
    )
    accelerator_config: SchedulerAcceleratorConfig = proto.Field(
        proto.MESSAGE,
        number=3,
        message=SchedulerAcceleratorConfig,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    input_notebook_file: str = proto.Field(
        proto.STRING,
        number=5,
    )
    container_image_uri: str = proto.Field(
        proto.STRING,
        number=6,
    )
    output_notebook_folder: str = proto.Field(
        proto.STRING,
        number=7,
    )
    params_yaml_file: str = proto.Field(
        proto.STRING,
        number=8,
    )
    parameters: str = proto.Field(
        proto.STRING,
        number=9,
    )
    service_account: str = proto.Field(
        proto.STRING,
        number=10,
    )
    job_type: JobType = proto.Field(
        proto.ENUM,
        number=11,
        enum=JobType,
    )
    dataproc_parameters: DataprocParameters = proto.Field(
        proto.MESSAGE,
        number=12,
        oneof='job_parameters',
        message=DataprocParameters,
    )
    vertex_ai_parameters: VertexAIParameters = proto.Field(
        proto.MESSAGE,
        number=13,
        oneof='job_parameters',
        message=VertexAIParameters,
    )
    kernel_spec: str = proto.Field(
        proto.STRING,
        number=14,
    )
    tensorboard: str = proto.Field(
        proto.STRING,
        number=15,
    )


class Execution(proto.Message):
    r"""The definition of a single executed notebook.

    Attributes:
        execution_template (google.events.cloud.notebooks_v1.types.ExecutionTemplate):
            execute metadata including name, hardware
            spec, region, labels, etc.
        name (str):
            Output only. The resource name of the execute. Format:
            ``projects/{project_id}/locations/{location}/executions/{execution_id}``
        display_name (str):
            Output only. Name used for UI purposes. Name can only
            contain alphanumeric characters and underscores '_'.
        description (str):
            A brief description of this execution.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time the Execution was
            instantiated.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time the Execution was last
            updated.
        state (google.events.cloud.notebooks_v1.types.Execution.State):
            Output only. State of the underlying AI
            Platform job.
        output_notebook_file (str):
            Output notebook file generated by this
            execution
        job_uri (str):
            Output only. The URI of the external job used
            to execute the notebook.
    """
    class State(proto.Enum):
        r"""Enum description of the state of the underlying AIP job.

        Values:
            STATE_UNSPECIFIED (0):
                The job state is unspecified.
            QUEUED (1):
                The job has been just created and processing
                has not yet begun.
            PREPARING (2):
                The service is preparing to execution the
                job.
            RUNNING (3):
                The job is in progress.
            SUCCEEDED (4):
                The job completed successfully.
            FAILED (5):
                The job failed. ``error_message`` should contain the details
                of the failure.
            CANCELLING (6):
                The job is being cancelled. ``error_message`` should
                describe the reason for the cancellation.
            CANCELLED (7):
                The job has been cancelled. ``error_message`` should
                describe the reason for the cancellation.
            EXPIRED (9):
                The job has become expired (relevant to
                Vertex AI jobs)
                https://cloud.google.com/vertex-ai/docs/reference/rest/v1/JobState
            INITIALIZING (10):
                The Execution is being created.
        """
        STATE_UNSPECIFIED = 0
        QUEUED = 1
        PREPARING = 2
        RUNNING = 3
        SUCCEEDED = 4
        FAILED = 5
        CANCELLING = 6
        CANCELLED = 7
        EXPIRED = 9
        INITIALIZING = 10

    execution_template: 'ExecutionTemplate' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='ExecutionTemplate',
    )
    name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=3,
    )
    description: str = proto.Field(
        proto.STRING,
        number=4,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=5,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=7,
        enum=State,
    )
    output_notebook_file: str = proto.Field(
        proto.STRING,
        number=8,
    )
    job_uri: str = proto.Field(
        proto.STRING,
        number=9,
    )


class ReservationAffinity(proto.Message):
    r"""Reservation Affinity for consuming Zonal reservation.

    Attributes:
        consume_reservation_type (google.events.cloud.notebooks_v1.types.ReservationAffinity.Type):
            Optional. Type of reservation to consume
        key (str):
            Optional. Corresponds to the label key of
            reservation resource.
        values (MutableSequence[str]):
            Optional. Corresponds to the label values of
            reservation resource.
    """
    class Type(proto.Enum):
        r"""Indicates whether to consume capacity from an reservation or
        not.

        Values:
            TYPE_UNSPECIFIED (0):
                Default type.
            NO_RESERVATION (1):
                Do not consume from any allocated capacity.
            ANY_RESERVATION (2):
                Consume any reservation available.
            SPECIFIC_RESERVATION (3):
                Must consume from a specific reservation.
                Must specify key value fields for specifying the
                reservations.
        """
        TYPE_UNSPECIFIED = 0
        NO_RESERVATION = 1
        ANY_RESERVATION = 2
        SPECIFIC_RESERVATION = 3

    consume_reservation_type: Type = proto.Field(
        proto.ENUM,
        number=1,
        enum=Type,
    )
    key: str = proto.Field(
        proto.STRING,
        number=2,
    )
    values: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=3,
    )


class Instance(proto.Message):
    r"""The definition of a notebook instance.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            Output only. The name of this notebook instance. Format:
            ``projects/{project_id}/locations/{location}/instances/{instance_id}``
        vm_image (google.events.cloud.notebooks_v1.types.VmImage):
            Use a Compute Engine VM image to start the
            notebook instance.

            This field is a member of `oneof`_ ``environment``.
        container_image (google.events.cloud.notebooks_v1.types.ContainerImage):
            Use a container image to start the notebook
            instance.

            This field is a member of `oneof`_ ``environment``.
        post_startup_script (str):
            Path to a Bash script that automatically runs after a
            notebook instance fully boots up. The path must be a URL or
            Cloud Storage path (``gs://path-to-file/file-name``).
        proxy_uri (str):
            Output only. The proxy endpoint that is used
            to access the Jupyter notebook.
        service_account (str):
            The service account on this instance, giving access to other
            Google Cloud services. You can use any service account
            within the same project, but you must have the service
            account user permission to use the instance.

            If not specified, the `Compute Engine default service
            account <https://cloud.google.com/compute/docs/access/service-accounts#default_service_account>`__
            is used.
        service_account_scopes (MutableSequence[str]):
            Optional. The URIs of service account scopes to be included
            in Compute Engine instances.

            If not specified, the following
            `scopes <https://cloud.google.com/compute/docs/access/service-accounts#accesscopesiam>`__
            are defined:

            -  https://www.googleapis.com/auth/cloud-platform
            -  https://www.googleapis.com/auth/userinfo.email If not
               using default scopes, you need at least:
               https://www.googleapis.com/auth/compute
        machine_type (str):
            Required. The `Compute Engine machine
            type <https://cloud.google.com/compute/docs/machine-types>`__
            of this instance.
        accelerator_config (google.events.cloud.notebooks_v1.types.Instance.AcceleratorConfig):
            The hardware accelerator used on this instance. If you use
            accelerators, make sure that your configuration has `enough
            vCPUs and memory to support the ``machine_type`` you have
            selected <https://cloud.google.com/compute/docs/gpus/#gpus-list>`__.
        state (google.events.cloud.notebooks_v1.types.Instance.State):
            Output only. The state of this instance.
        install_gpu_driver (bool):
            Whether the end user authorizes Google Cloud
            to install GPU driver on this instance.
            If this field is empty or set to false, the GPU
            driver won't be installed. Only applicable to
            instances with GPUs.
        custom_gpu_driver_path (str):
            Specify a custom Cloud Storage path where the
            GPU driver is stored. If not specified, we'll
            automatically choose from official GPU drivers.
        disks (MutableSequence[google.events.cloud.notebooks_v1.types.Instance.Disk]):
            Output only. Attached disks to notebook
            instance.
        shielded_instance_config (google.events.cloud.notebooks_v1.types.Instance.ShieldedInstanceConfig):
            Optional. Shielded VM configuration. `Images using supported
            Shielded VM
            features <https://cloud.google.com/compute/docs/instances/modifying-shielded-vm>`__.
        no_public_ip (bool):
            If true, no external IP will be assigned to
            this instance.
        no_proxy_access (bool):
            If true, the notebook instance will not
            register with the proxy.
        network (str):
            The name of the VPC that this instance is in. Format:
            ``projects/{project_id}/global/networks/{network_id}``
        subnet (str):
            The name of the subnet that this instance is in. Format:
            ``projects/{project_id}/regions/{region}/subnetworks/{subnetwork_id}``
        labels (MutableMapping[str, str]):
            Labels to apply to this instance.
            These can be later modified by the setLabels
            method.
        metadata (MutableMapping[str, str]):
            Custom metadata to apply to this instance.
        tags (MutableSequence[str]):
            Optional. The Compute Engine tags to add to runtime (see
            `Tagging
            instances <https://cloud.google.com/compute/docs/label-or-tag-resources#tags>`__).
        upgrade_history (MutableSequence[google.events.cloud.notebooks_v1.types.Instance.UpgradeHistoryEntry]):
            The upgrade history of this instance.
        nic_type (google.events.cloud.notebooks_v1.types.Instance.NicType):
            Optional. The type of vNIC to be used on this
            interface. This may be gVNIC or VirtioNet.
        reservation_affinity (google.events.cloud.notebooks_v1.types.ReservationAffinity):
            Optional. The optional reservation affinity. Setting this
            field will apply the specified `Zonal Compute
            Reservation <https://cloud.google.com/compute/docs/instances/reserving-zonal-resources>`__
            to this notebook instance.
        creator (str):
            Output only. Email address of entity that
            sent original CreateInstance request.
        can_ip_forward (bool):
            Optional. Flag to enable ip forwarding or
            not, default false/off.
            https://cloud.google.com/vpc/docs/using-routes#canipforward
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Instance creation time.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Instance update time.
    """
    class AcceleratorType(proto.Enum):
        r"""Definition of the types of hardware accelerators that can be
        used on this instance.

        Values:
            ACCELERATOR_TYPE_UNSPECIFIED (0):
                Accelerator type is not specified.
            NVIDIA_TESLA_K80 (1):
                Accelerator type is Nvidia Tesla K80.
            NVIDIA_TESLA_P100 (2):
                Accelerator type is Nvidia Tesla P100.
            NVIDIA_TESLA_V100 (3):
                Accelerator type is Nvidia Tesla V100.
            NVIDIA_TESLA_P4 (4):
                Accelerator type is Nvidia Tesla P4.
            NVIDIA_TESLA_T4 (5):
                Accelerator type is Nvidia Tesla T4.
            NVIDIA_TESLA_A100 (11):
                Accelerator type is Nvidia Tesla A100.
            NVIDIA_TESLA_T4_VWS (8):
                Accelerator type is NVIDIA Tesla T4 Virtual
                Workstations.
            NVIDIA_TESLA_P100_VWS (9):
                Accelerator type is NVIDIA Tesla P100 Virtual
                Workstations.
            NVIDIA_TESLA_P4_VWS (10):
                Accelerator type is NVIDIA Tesla P4 Virtual
                Workstations.
            TPU_V2 (6):
                (Coming soon) Accelerator type is TPU V2.
            TPU_V3 (7):
                (Coming soon) Accelerator type is TPU V3.
        """
        ACCELERATOR_TYPE_UNSPECIFIED = 0
        NVIDIA_TESLA_K80 = 1
        NVIDIA_TESLA_P100 = 2
        NVIDIA_TESLA_V100 = 3
        NVIDIA_TESLA_P4 = 4
        NVIDIA_TESLA_T4 = 5
        NVIDIA_TESLA_A100 = 11
        NVIDIA_TESLA_T4_VWS = 8
        NVIDIA_TESLA_P100_VWS = 9
        NVIDIA_TESLA_P4_VWS = 10
        TPU_V2 = 6
        TPU_V3 = 7

    class State(proto.Enum):
        r"""The definition of the states of this instance.

        Values:
            STATE_UNSPECIFIED (0):
                State is not specified.
            STARTING (1):
                The control logic is starting the instance.
            PROVISIONING (2):
                The control logic is installing required
                frameworks and registering the instance with
                notebook proxy
            ACTIVE (3):
                The instance is running.
            STOPPING (4):
                The control logic is stopping the instance.
            STOPPED (5):
                The instance is stopped.
            DELETED (6):
                The instance is deleted.
            UPGRADING (7):
                The instance is upgrading.
            INITIALIZING (8):
                The instance is being created.
            REGISTERING (9):
                The instance is getting registered.
            SUSPENDING (10):
                The instance is suspending.
            SUSPENDED (11):
                The instance is suspended.
        """
        STATE_UNSPECIFIED = 0
        STARTING = 1
        PROVISIONING = 2
        ACTIVE = 3
        STOPPING = 4
        STOPPED = 5
        DELETED = 6
        UPGRADING = 7
        INITIALIZING = 8
        REGISTERING = 9
        SUSPENDING = 10
        SUSPENDED = 11

    class DiskType(proto.Enum):
        r"""Possible disk types for notebook instances.

        Values:
            DISK_TYPE_UNSPECIFIED (0):
                Disk type not set.
            PD_STANDARD (1):
                Standard persistent disk type.
            PD_SSD (2):
                SSD persistent disk type.
            PD_BALANCED (3):
                Balanced persistent disk type.
            PD_EXTREME (4):
                Extreme persistent disk type.
        """
        DISK_TYPE_UNSPECIFIED = 0
        PD_STANDARD = 1
        PD_SSD = 2
        PD_BALANCED = 3
        PD_EXTREME = 4

    class DiskEncryption(proto.Enum):
        r"""Definition of the disk encryption options.

        Values:
            DISK_ENCRYPTION_UNSPECIFIED (0):
                Disk encryption is not specified.
            GMEK (1):
                Use Google managed encryption keys to encrypt
                the boot disk.
            CMEK (2):
                Use customer managed encryption keys to
                encrypt the boot disk.
        """
        DISK_ENCRYPTION_UNSPECIFIED = 0
        GMEK = 1
        CMEK = 2

    class NicType(proto.Enum):
        r"""The type of vNIC driver. Default should be UNSPECIFIED_NIC_TYPE.

        Values:
            UNSPECIFIED_NIC_TYPE (0):
                No type specified.
            VIRTIO_NET (1):
                VIRTIO
            GVNIC (2):
                GVNIC
        """
        UNSPECIFIED_NIC_TYPE = 0
        VIRTIO_NET = 1
        GVNIC = 2

    class AcceleratorConfig(proto.Message):
        r"""Definition of a hardware accelerator. Note that not all combinations
        of ``type`` and ``core_count`` are valid. See `GPUs on Compute
        Engine <https://cloud.google.com/compute/docs/gpus/#gpus-list>`__ to
        find a valid combination. TPUs are not supported.

        Attributes:
            type_ (google.events.cloud.notebooks_v1.types.Instance.AcceleratorType):
                Type of this accelerator.
            core_count (int):
                Count of cores of this accelerator.
        """

        type_: 'Instance.AcceleratorType' = proto.Field(
            proto.ENUM,
            number=1,
            enum='Instance.AcceleratorType',
        )
        core_count: int = proto.Field(
            proto.INT64,
            number=2,
        )

    class Disk(proto.Message):
        r"""An instance-attached disk resource.

        Attributes:
            auto_delete (bool):
                Indicates whether the disk will be
                auto-deleted when the instance is deleted (but
                not when the disk is detached from the
                instance).
            boot (bool):
                Indicates that this is a boot disk. The
                virtual machine will use the first partition of
                the disk for its root filesystem.
            device_name (str):
                Indicates a unique device name of your choice that is
                reflected into the ``/dev/disk/by-id/google-*`` tree of a
                Linux operating system running within the instance. This
                name can be used to reference the device for mounting,
                resizing, and so on, from within the instance.

                If not specified, the server chooses a default device name
                to apply to this disk, in the form persistent-disk-x, where
                x is a number assigned by Google Compute Engine.This field
                is only applicable for persistent disks.
            disk_size_gb (int):
                Indicates the size of the disk in base-2 GB.
            guest_os_features (MutableSequence[google.events.cloud.notebooks_v1.types.Instance.Disk.GuestOsFeature]):
                Indicates a list of features to enable on the
                guest operating system. Applicable only for
                bootable images. Read  Enabling guest operating
                system features to see a list of available
                options.
            index (int):
                A zero-based index to this disk, where 0 is
                reserved for the boot disk. If you have many
                disks attached to an instance, each disk would
                have a unique index number.
            interface (str):
                Indicates the disk interface to use for attaching this disk,
                which is either SCSI or NVME. The default is SCSI.
                Persistent disks must always use SCSI and the request will
                fail if you attempt to attach a persistent disk in any other
                format than SCSI. Local SSDs can use either NVME or SCSI.
                For performance characteristics of SCSI over NVMe, see Local
                SSD performance. Valid values:

                -  ``NVME``
                -  ``SCSI``
            kind (str):
                Type of the resource. Always
                compute#attachedDisk for attached disks.
            licenses (MutableSequence[str]):
                A list of publicly visible licenses. Reserved
                for Google's use. A License represents billing
                and aggregate usage data for public and
                marketplace images.
            mode (str):
                The mode in which to attach this disk, either ``READ_WRITE``
                or ``READ_ONLY``. If not specified, the default is to attach
                the disk in ``READ_WRITE`` mode. Valid values:

                -  ``READ_ONLY``
                -  ``READ_WRITE``
            source (str):
                Indicates a valid partial or full URL to an
                existing Persistent Disk resource.
            type_ (str):
                Indicates the type of the disk, either ``SCRATCH`` or
                ``PERSISTENT``. Valid values:

                -  ``PERSISTENT``
                -  ``SCRATCH``
        """

        class GuestOsFeature(proto.Message):
            r"""Guest OS features for boot disk.

            Attributes:
                type_ (str):
                    The ID of a supported feature. Read Enabling guest operating
                    system features to see a list of available options. Valid
                    values:

                    -  ``FEATURE_TYPE_UNSPECIFIED``
                    -  ``MULTI_IP_SUBNET``
                    -  ``SECURE_BOOT``
                    -  ``UEFI_COMPATIBLE``
                    -  ``VIRTIO_SCSI_MULTIQUEUE``
                    -  ``WINDOWS``
            """

            type_: str = proto.Field(
                proto.STRING,
                number=1,
            )

        auto_delete: bool = proto.Field(
            proto.BOOL,
            number=1,
        )
        boot: bool = proto.Field(
            proto.BOOL,
            number=2,
        )
        device_name: str = proto.Field(
            proto.STRING,
            number=3,
        )
        disk_size_gb: int = proto.Field(
            proto.INT64,
            number=4,
        )
        guest_os_features: MutableSequence['Instance.Disk.GuestOsFeature'] = proto.RepeatedField(
            proto.MESSAGE,
            number=5,
            message='Instance.Disk.GuestOsFeature',
        )
        index: int = proto.Field(
            proto.INT64,
            number=6,
        )
        interface: str = proto.Field(
            proto.STRING,
            number=7,
        )
        kind: str = proto.Field(
            proto.STRING,
            number=8,
        )
        licenses: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=9,
        )
        mode: str = proto.Field(
            proto.STRING,
            number=10,
        )
        source: str = proto.Field(
            proto.STRING,
            number=11,
        )
        type_: str = proto.Field(
            proto.STRING,
            number=12,
        )

    class ShieldedInstanceConfig(proto.Message):
        r"""A set of Shielded Instance options. See `Images using supported
        Shielded VM
        features <https://cloud.google.com/compute/docs/instances/modifying-shielded-vm>`__.
        Not all combinations are valid.

        Attributes:
            enable_secure_boot (bool):
                Defines whether the instance has Secure Boot
                enabled.
                Secure Boot helps ensure that the system only
                runs authentic software by verifying the digital
                signature of all boot components, and halting
                the boot process if signature verification
                fails. Disabled by default.
            enable_vtpm (bool):
                Defines whether the instance has the vTPM
                enabled. Enabled by default.
            enable_integrity_monitoring (bool):
                Defines whether the instance has integrity
                monitoring enabled.
                Enables monitoring and attestation of the boot
                integrity of the instance. The attestation is
                performed against the integrity policy baseline.
                This baseline is initially derived from the
                implicitly trusted boot image when the instance
                is created. Enabled by default.
        """

        enable_secure_boot: bool = proto.Field(
            proto.BOOL,
            number=1,
        )
        enable_vtpm: bool = proto.Field(
            proto.BOOL,
            number=2,
        )
        enable_integrity_monitoring: bool = proto.Field(
            proto.BOOL,
            number=3,
        )

    class UpgradeHistoryEntry(proto.Message):
        r"""The entry of VM image upgrade history.

        Attributes:
            snapshot (str):
                The snapshot of the boot disk of this
                notebook instance before upgrade.
            vm_image (str):
                The VM image before this instance upgrade.
            container_image (str):
                The container image before this instance
                upgrade.
            framework (str):
                The framework of this notebook instance.
            version (str):
                The version of the notebook instance before
                this upgrade.
            state (google.events.cloud.notebooks_v1.types.Instance.UpgradeHistoryEntry.State):
                The state of this instance upgrade history
                entry.
            create_time (google.protobuf.timestamp_pb2.Timestamp):
                The time that this instance upgrade history
                entry is created.
            target_image (str):
                Target VM Image. Format:
                ``ainotebooks-vm/project/image-name/name``.
            action (google.events.cloud.notebooks_v1.types.Instance.UpgradeHistoryEntry.Action):
                Action. Rolloback or Upgrade.
            target_version (str):
                Target VM Version, like m63.
        """
        class State(proto.Enum):
            r"""The definition of the states of this upgrade history entry.

            Values:
                STATE_UNSPECIFIED (0):
                    State is not specified.
                STARTED (1):
                    The instance upgrade is started.
                SUCCEEDED (2):
                    The instance upgrade is succeeded.
                FAILED (3):
                    The instance upgrade is failed.
            """
            STATE_UNSPECIFIED = 0
            STARTED = 1
            SUCCEEDED = 2
            FAILED = 3

        class Action(proto.Enum):
            r"""The definition of operations of this upgrade history entry.

            Values:
                ACTION_UNSPECIFIED (0):
                    Operation is not specified.
                UPGRADE (1):
                    Upgrade.
                ROLLBACK (2):
                    Rollback.
            """
            ACTION_UNSPECIFIED = 0
            UPGRADE = 1
            ROLLBACK = 2

        snapshot: str = proto.Field(
            proto.STRING,
            number=1,
        )
        vm_image: str = proto.Field(
            proto.STRING,
            number=2,
        )
        container_image: str = proto.Field(
            proto.STRING,
            number=3,
        )
        framework: str = proto.Field(
            proto.STRING,
            number=4,
        )
        version: str = proto.Field(
            proto.STRING,
            number=5,
        )
        state: 'Instance.UpgradeHistoryEntry.State' = proto.Field(
            proto.ENUM,
            number=6,
            enum='Instance.UpgradeHistoryEntry.State',
        )
        create_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=7,
            message=timestamp_pb2.Timestamp,
        )
        target_image: str = proto.Field(
            proto.STRING,
            number=8,
        )
        action: 'Instance.UpgradeHistoryEntry.Action' = proto.Field(
            proto.ENUM,
            number=9,
            enum='Instance.UpgradeHistoryEntry.Action',
        )
        target_version: str = proto.Field(
            proto.STRING,
            number=10,
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    vm_image: 'VmImage' = proto.Field(
        proto.MESSAGE,
        number=2,
        oneof='environment',
        message='VmImage',
    )
    container_image: 'ContainerImage' = proto.Field(
        proto.MESSAGE,
        number=3,
        oneof='environment',
        message='ContainerImage',
    )
    post_startup_script: str = proto.Field(
        proto.STRING,
        number=4,
    )
    proxy_uri: str = proto.Field(
        proto.STRING,
        number=5,
    )
    service_account: str = proto.Field(
        proto.STRING,
        number=7,
    )
    service_account_scopes: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=31,
    )
    machine_type: str = proto.Field(
        proto.STRING,
        number=8,
    )
    accelerator_config: AcceleratorConfig = proto.Field(
        proto.MESSAGE,
        number=9,
        message=AcceleratorConfig,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=10,
        enum=State,
    )
    install_gpu_driver: bool = proto.Field(
        proto.BOOL,
        number=11,
    )
    custom_gpu_driver_path: str = proto.Field(
        proto.STRING,
        number=12,
    )
    disks: MutableSequence[Disk] = proto.RepeatedField(
        proto.MESSAGE,
        number=28,
        message=Disk,
    )
    shielded_instance_config: ShieldedInstanceConfig = proto.Field(
        proto.MESSAGE,
        number=30,
        message=ShieldedInstanceConfig,
    )
    no_public_ip: bool = proto.Field(
        proto.BOOL,
        number=17,
    )
    no_proxy_access: bool = proto.Field(
        proto.BOOL,
        number=18,
    )
    network: str = proto.Field(
        proto.STRING,
        number=19,
    )
    subnet: str = proto.Field(
        proto.STRING,
        number=20,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=21,
    )
    metadata: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=22,
    )
    tags: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=32,
    )
    upgrade_history: MutableSequence[UpgradeHistoryEntry] = proto.RepeatedField(
        proto.MESSAGE,
        number=29,
        message=UpgradeHistoryEntry,
    )
    nic_type: NicType = proto.Field(
        proto.ENUM,
        number=33,
        enum=NicType,
    )
    reservation_affinity: 'ReservationAffinity' = proto.Field(
        proto.MESSAGE,
        number=34,
        message='ReservationAffinity',
    )
    creator: str = proto.Field(
        proto.STRING,
        number=36,
    )
    can_ip_forward: bool = proto.Field(
        proto.BOOL,
        number=39,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=23,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=24,
        message=timestamp_pb2.Timestamp,
    )


class Schedule(proto.Message):
    r"""The definition of a schedule.

    Attributes:
        name (str):
            Output only. The name of this schedule. Format:
            ``projects/{project_id}/locations/{location}/schedules/{schedule_id}``
        display_name (str):
            Output only. Display name used for UI purposes. Name can
            only contain alphanumeric characters, hyphens ``-``, and
            underscores ``_``.
        description (str):
            A brief description of this environment.
        state (google.events.cloud.notebooks_v1.types.Schedule.State):

        cron_schedule (str):
            Cron-tab formatted schedule by which the job will execute.
            Format: minute, hour, day of month, month, day of week, e.g.
            ``0 0 * * WED`` = every Wednesday More examples:
            https://crontab.guru/examples.html
        time_zone (str):
            Timezone on which the cron_schedule. The value of this field
            must be a time zone name from the tz database. TZ Database:
            https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

            Note that some time zones include a provision for daylight
            savings time. The rules for daylight saving time are
            determined by the chosen tz. For UTC use the string "utc".
            If a time zone is not specified, the default will be in UTC
            (also known as GMT).
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time the schedule was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. Time the schedule was last
            updated.
        execution_template (google.events.cloud.notebooks_v1.types.ExecutionTemplate):
            Notebook Execution Template corresponding to
            this schedule.
        recent_executions (MutableSequence[google.events.cloud.notebooks_v1.types.Execution]):
            Output only. The most recent execution names
            triggered from this schedule and their
            corresponding states.
    """
    class State(proto.Enum):
        r"""State of the job.

        Values:
            STATE_UNSPECIFIED (0):
                Unspecified state.
            ENABLED (1):
                The job is executing normally.
            PAUSED (2):
                The job is paused by the user. It will not execute. A user
                can intentionally pause the job using [PauseJobRequest][].
            DISABLED (3):
                The job is disabled by the system due to
                error. The user cannot directly set a job to be
                disabled.
            UPDATE_FAILED (4):
                The job state resulting from a failed
                [CloudScheduler.UpdateJob][] operation. To recover a job
                from this state, retry [CloudScheduler.UpdateJob][] until a
                successful response is received.
            INITIALIZING (5):
                The schedule resource is being created.
            DELETING (6):
                The schedule resource is being deleted.
        """
        STATE_UNSPECIFIED = 0
        ENABLED = 1
        PAUSED = 2
        DISABLED = 3
        UPDATE_FAILED = 4
        INITIALIZING = 5
        DELETING = 6

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=4,
        enum=State,
    )
    cron_schedule: str = proto.Field(
        proto.STRING,
        number=5,
    )
    time_zone: str = proto.Field(
        proto.STRING,
        number=6,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=8,
        message=timestamp_pb2.Timestamp,
    )
    execution_template: 'ExecutionTemplate' = proto.Field(
        proto.MESSAGE,
        number=9,
        message='ExecutionTemplate',
    )
    recent_executions: MutableSequence['Execution'] = proto.RepeatedField(
        proto.MESSAGE,
        number=10,
        message='Execution',
    )


class RuntimeEventData(proto.Message):
    r"""The data within all Runtime events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.notebooks_v1.types.Runtime):
            Optional. The Runtime event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Runtime' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Runtime',
    )


class ExecutionEventData(proto.Message):
    r"""The data within all Execution events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.notebooks_v1.types.Execution):
            Optional. The Execution event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Execution' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Execution',
    )


class InstanceEventData(proto.Message):
    r"""The data within all Instance events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.notebooks_v1.types.Instance):
            Optional. The Instance event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Instance' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Instance',
    )


class ScheduleEventData(proto.Message):
    r"""The data within all Schedule events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.notebooks_v1.types.Schedule):
            Optional. The Schedule event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Schedule' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Schedule',
    )


class EnvironmentEventData(proto.Message):
    r"""The data within all Environment events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.notebooks_v1.types.Environment):
            Optional. The Environment event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Environment' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Environment',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
