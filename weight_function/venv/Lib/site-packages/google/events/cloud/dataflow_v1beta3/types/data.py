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

from google.protobuf import struct_pb2  # type: ignore
from google.protobuf import timestamp_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.dataflow.v1beta3',
    manifest={
        'JobType',
        'FlexResourceSchedulingGoal',
        'TeardownPolicy',
        'DefaultPackageSet',
        'AutoscalingAlgorithm',
        'WorkerIPAddressConfiguration',
        'ShuffleMode',
        'JobState',
        'Environment',
        'Package',
        'AutoscalingSettings',
        'SdkHarnessContainerImage',
        'WorkerPool',
        'DebugOptions',
        'Job',
        'DatastoreIODetails',
        'PubSubIODetails',
        'FileIODetails',
        'BigTableIODetails',
        'BigQueryIODetails',
        'SpannerIODetails',
        'SdkVersion',
        'JobMetadata',
        'ExecutionStageState',
        'JobExecutionInfo',
        'JobExecutionStageInfo',
        'JobEventData',
    },
)


class JobType(proto.Enum):
    r"""Specifies the processing model used by a
    [google.dataflow.v1beta3.Job], which determines the way the Job is
    managed by the Cloud Dataflow service (how workers are scheduled,
    how inputs are sharded, etc).

    Values:
        JOB_TYPE_UNKNOWN (0):
            The type of the job is unspecified, or
            unknown.
        JOB_TYPE_BATCH (1):
            A batch job with a well-defined end point:
            data is read, data is processed, data is
            written, and the job is done.
        JOB_TYPE_STREAMING (2):
            A continuously streaming job with no end:
            data is read, processed, and written
            continuously.
    """
    JOB_TYPE_UNKNOWN = 0
    JOB_TYPE_BATCH = 1
    JOB_TYPE_STREAMING = 2


class FlexResourceSchedulingGoal(proto.Enum):
    r"""Specifies the resource to optimize for in Flexible Resource
    Scheduling.

    Values:
        FLEXRS_UNSPECIFIED (0):
            Run in the default mode.
        FLEXRS_SPEED_OPTIMIZED (1):
            Optimize for lower execution time.
        FLEXRS_COST_OPTIMIZED (2):
            Optimize for lower cost.
    """
    FLEXRS_UNSPECIFIED = 0
    FLEXRS_SPEED_OPTIMIZED = 1
    FLEXRS_COST_OPTIMIZED = 2


class TeardownPolicy(proto.Enum):
    r"""Specifies what happens to a resource when a Cloud Dataflow
    [google.dataflow.v1beta3.Job][google.dataflow.v1beta3.Job] has
    completed.

    Values:
        TEARDOWN_POLICY_UNKNOWN (0):
            The teardown policy isn't specified, or is
            unknown.
        TEARDOWN_ALWAYS (1):
            Always teardown the resource.
        TEARDOWN_ON_SUCCESS (2):
            Teardown the resource on success. This is
            useful for debugging failures.
        TEARDOWN_NEVER (3):
            Never teardown the resource. This is useful
            for debugging and development.
    """
    TEARDOWN_POLICY_UNKNOWN = 0
    TEARDOWN_ALWAYS = 1
    TEARDOWN_ON_SUCCESS = 2
    TEARDOWN_NEVER = 3


class DefaultPackageSet(proto.Enum):
    r"""The default set of packages to be staged on a pool of
    workers.

    Values:
        DEFAULT_PACKAGE_SET_UNKNOWN (0):
            The default set of packages to stage is
            unknown, or unspecified.
        DEFAULT_PACKAGE_SET_NONE (1):
            Indicates that no packages should be staged
            at the worker unless explicitly specified by the
            job.
        DEFAULT_PACKAGE_SET_JAVA (2):
            Stage packages typically useful to workers
            written in Java.
        DEFAULT_PACKAGE_SET_PYTHON (3):
            Stage packages typically useful to workers
            written in Python.
    """
    DEFAULT_PACKAGE_SET_UNKNOWN = 0
    DEFAULT_PACKAGE_SET_NONE = 1
    DEFAULT_PACKAGE_SET_JAVA = 2
    DEFAULT_PACKAGE_SET_PYTHON = 3


class AutoscalingAlgorithm(proto.Enum):
    r"""Specifies the algorithm used to determine the number of
    worker processes to run at any given point in time, based on the
    amount of data left to process, the number of workers, and how
    quickly existing workers are processing data.

    Values:
        AUTOSCALING_ALGORITHM_UNKNOWN (0):
            The algorithm is unknown, or unspecified.
        AUTOSCALING_ALGORITHM_NONE (1):
            Disable autoscaling.
        AUTOSCALING_ALGORITHM_BASIC (2):
            Increase worker count over time to reduce job
            execution time.
    """
    AUTOSCALING_ALGORITHM_UNKNOWN = 0
    AUTOSCALING_ALGORITHM_NONE = 1
    AUTOSCALING_ALGORITHM_BASIC = 2


class WorkerIPAddressConfiguration(proto.Enum):
    r"""Specifies how IP addresses should be allocated to the worker
    machines.

    Values:
        WORKER_IP_UNSPECIFIED (0):
            The configuration is unknown, or unspecified.
        WORKER_IP_PUBLIC (1):
            Workers should have public IP addresses.
        WORKER_IP_PRIVATE (2):
            Workers should have private IP addresses.
    """
    WORKER_IP_UNSPECIFIED = 0
    WORKER_IP_PUBLIC = 1
    WORKER_IP_PRIVATE = 2


class ShuffleMode(proto.Enum):
    r"""Specifies the shuffle mode used by a [google.dataflow.v1beta3.Job],
    which determines the approach data is shuffled during processing.
    More details in:
    https://cloud.google.com/dataflow/docs/guides/deploying-a-pipeline#dataflow-shuffle

    Values:
        SHUFFLE_MODE_UNSPECIFIED (0):
            Shuffle mode information is not available.
        VM_BASED (1):
            Shuffle is done on the worker VMs.
        SERVICE_BASED (2):
            Shuffle is done on the service side.
    """
    SHUFFLE_MODE_UNSPECIFIED = 0
    VM_BASED = 1
    SERVICE_BASED = 2


class JobState(proto.Enum):
    r"""Describes the overall state of a
    [google.dataflow.v1beta3.Job][google.dataflow.v1beta3.Job].

    Values:
        JOB_STATE_UNKNOWN (0):
            The job's run state isn't specified.
        JOB_STATE_STOPPED (1):
            ``JOB_STATE_STOPPED`` indicates that the job has not yet
            started to run.
        JOB_STATE_RUNNING (2):
            ``JOB_STATE_RUNNING`` indicates that the job is currently
            running.
        JOB_STATE_DONE (3):
            ``JOB_STATE_DONE`` indicates that the job has successfully
            completed. This is a terminal job state. This state may be
            set by the Cloud Dataflow service, as a transition from
            ``JOB_STATE_RUNNING``. It may also be set via a Cloud
            Dataflow ``UpdateJob`` call, if the job has not yet reached
            a terminal state.
        JOB_STATE_FAILED (4):
            ``JOB_STATE_FAILED`` indicates that the job has failed. This
            is a terminal job state. This state may only be set by the
            Cloud Dataflow service, and only as a transition from
            ``JOB_STATE_RUNNING``.
        JOB_STATE_CANCELLED (5):
            ``JOB_STATE_CANCELLED`` indicates that the job has been
            explicitly cancelled. This is a terminal job state. This
            state may only be set via a Cloud Dataflow ``UpdateJob``
            call, and only if the job has not yet reached another
            terminal state.
        JOB_STATE_UPDATED (6):
            ``JOB_STATE_UPDATED`` indicates that the job was
            successfully updated, meaning that this job was stopped and
            another job was started, inheriting state from this one.
            This is a terminal job state. This state may only be set by
            the Cloud Dataflow service, and only as a transition from
            ``JOB_STATE_RUNNING``.
        JOB_STATE_DRAINING (7):
            ``JOB_STATE_DRAINING`` indicates that the job is in the
            process of draining. A draining job has stopped pulling from
            its input sources and is processing any data that remains
            in-flight. This state may be set via a Cloud Dataflow
            ``UpdateJob`` call, but only as a transition from
            ``JOB_STATE_RUNNING``. Jobs that are draining may only
            transition to ``JOB_STATE_DRAINED``,
            ``JOB_STATE_CANCELLED``, or ``JOB_STATE_FAILED``.
        JOB_STATE_DRAINED (8):
            ``JOB_STATE_DRAINED`` indicates that the job has been
            drained. A drained job terminated by stopping pulling from
            its input sources and processing any data that remained
            in-flight when draining was requested. This state is a
            terminal state, may only be set by the Cloud Dataflow
            service, and only as a transition from
            ``JOB_STATE_DRAINING``.
        JOB_STATE_PENDING (9):
            ``JOB_STATE_PENDING`` indicates that the job has been
            created but is not yet running. Jobs that are pending may
            only transition to ``JOB_STATE_RUNNING``, or
            ``JOB_STATE_FAILED``.
        JOB_STATE_CANCELLING (10):
            ``JOB_STATE_CANCELLING`` indicates that the job has been
            explicitly cancelled and is in the process of stopping. Jobs
            that are cancelling may only transition to
            ``JOB_STATE_CANCELLED`` or ``JOB_STATE_FAILED``.
        JOB_STATE_QUEUED (11):
            ``JOB_STATE_QUEUED`` indicates that the job has been created
            but is being delayed until launch. Jobs that are queued may
            only transition to ``JOB_STATE_PENDING`` or
            ``JOB_STATE_CANCELLED``.
        JOB_STATE_RESOURCE_CLEANING_UP (12):
            ``JOB_STATE_RESOURCE_CLEANING_UP`` indicates that the batch
            job's associated resources are currently being cleaned up
            after a successful run. Currently, this is an opt-in
            feature, please reach out to Cloud support team if you are
            interested.
    """
    JOB_STATE_UNKNOWN = 0
    JOB_STATE_STOPPED = 1
    JOB_STATE_RUNNING = 2
    JOB_STATE_DONE = 3
    JOB_STATE_FAILED = 4
    JOB_STATE_CANCELLED = 5
    JOB_STATE_UPDATED = 6
    JOB_STATE_DRAINING = 7
    JOB_STATE_DRAINED = 8
    JOB_STATE_PENDING = 9
    JOB_STATE_CANCELLING = 10
    JOB_STATE_QUEUED = 11
    JOB_STATE_RESOURCE_CLEANING_UP = 12


class Environment(proto.Message):
    r"""Describes the environment in which a Dataflow Job runs.

    Attributes:
        temp_storage_prefix (str):
            The prefix of the resources the system should use for
            temporary storage. The system will append the suffix
            "/temp-{JOBNAME} to this resource prefix, where {JOBNAME} is
            the value of the job_name field. The resulting bucket and
            object prefix is used as the prefix of the resources used to
            store temporary data needed during the job execution. NOTE:
            This will override the value in taskrunner_settings. The
            supported resource type is:

            Google Cloud Storage:

            storage.googleapis.com/{bucket}/{object}
            bucket.storage.googleapis.com/{object}
        cluster_manager_api_service (str):
            The type of cluster manager API to use.  If
            unknown or unspecified, the service will attempt
            to choose a reasonable default.  This should be
            in the form of the API service name, e.g.
            "compute.googleapis.com".
        experiments (MutableSequence[str]):
            The list of experiments to enable. This field should be used
            for SDK related experiments and not for service related
            experiments. The proper field for service related
            experiments is service_options.
        service_options (MutableSequence[str]):
            The list of service options to enable. This
            field should be used for service related
            experiments only. These experiments, when
            graduating to GA, should be replaced by
            dedicated fields or become default (i.e. always
            on).
        service_kms_key_name (str):
            If set, contains the Cloud KMS key identifier used to
            encrypt data at rest, AKA a Customer Managed Encryption Key
            (CMEK).

            Format:
            projects/PROJECT_ID/locations/LOCATION/keyRings/KEY_RING/cryptoKeys/KEY
        worker_pools (MutableSequence[google.events.cloud.dataflow_v1beta3.types.WorkerPool]):
            The worker pools. At least one "harness"
            worker pool must be specified in order for the
            job to have workers.
        user_agent (google.protobuf.struct_pb2.Struct):
            A description of the process that generated
            the request.
        version (google.protobuf.struct_pb2.Struct):
            A structure describing which components and
            their versions of the service are required in
            order to run the job.
        dataset (str):
            The dataset for the current project where
            various workflow related tables are stored.

            The supported resource type is:

            Google BigQuery:

              bigquery.googleapis.com/{dataset}
        sdk_pipeline_options (google.protobuf.struct_pb2.Struct):
            The Cloud Dataflow SDK pipeline options
            specified by the user. These options are passed
            through the service and are used to recreate the
            SDK pipeline options on the worker in a language
            agnostic and platform independent way.
        service_account_email (str):
            Identity to run virtual machines as. Defaults
            to the default account.
        flex_resource_scheduling_goal (google.events.cloud.dataflow_v1beta3.types.FlexResourceSchedulingGoal):
            Which Flexible Resource Scheduling mode to
            run in.
        worker_region (str):
            The Compute Engine region
            (https://cloud.google.com/compute/docs/regions-zones/regions-zones)
            in which worker processing should occur, e.g. "us-west1".
            Mutually exclusive with worker_zone. If neither
            worker_region nor worker_zone is specified, default to the
            control plane's region.
        worker_zone (str):
            The Compute Engine zone
            (https://cloud.google.com/compute/docs/regions-zones/regions-zones)
            in which worker processing should occur, e.g. "us-west1-a".
            Mutually exclusive with worker_region. If neither
            worker_region nor worker_zone is specified, a zone in the
            control plane's region is chosen based on available
            capacity.
        shuffle_mode (google.events.cloud.dataflow_v1beta3.types.ShuffleMode):
            Output only. The shuffle mode used for the
            job.
        debug_options (google.events.cloud.dataflow_v1beta3.types.DebugOptions):
            Any debugging options to be supplied to the
            job.
    """

    temp_storage_prefix: str = proto.Field(
        proto.STRING,
        number=1,
    )
    cluster_manager_api_service: str = proto.Field(
        proto.STRING,
        number=2,
    )
    experiments: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=3,
    )
    service_options: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=16,
    )
    service_kms_key_name: str = proto.Field(
        proto.STRING,
        number=12,
    )
    worker_pools: MutableSequence['WorkerPool'] = proto.RepeatedField(
        proto.MESSAGE,
        number=4,
        message='WorkerPool',
    )
    user_agent: struct_pb2.Struct = proto.Field(
        proto.MESSAGE,
        number=5,
        message=struct_pb2.Struct,
    )
    version: struct_pb2.Struct = proto.Field(
        proto.MESSAGE,
        number=6,
        message=struct_pb2.Struct,
    )
    dataset: str = proto.Field(
        proto.STRING,
        number=7,
    )
    sdk_pipeline_options: struct_pb2.Struct = proto.Field(
        proto.MESSAGE,
        number=8,
        message=struct_pb2.Struct,
    )
    service_account_email: str = proto.Field(
        proto.STRING,
        number=10,
    )
    flex_resource_scheduling_goal: 'FlexResourceSchedulingGoal' = proto.Field(
        proto.ENUM,
        number=11,
        enum='FlexResourceSchedulingGoal',
    )
    worker_region: str = proto.Field(
        proto.STRING,
        number=13,
    )
    worker_zone: str = proto.Field(
        proto.STRING,
        number=14,
    )
    shuffle_mode: 'ShuffleMode' = proto.Field(
        proto.ENUM,
        number=15,
        enum='ShuffleMode',
    )
    debug_options: 'DebugOptions' = proto.Field(
        proto.MESSAGE,
        number=17,
        message='DebugOptions',
    )


class Package(proto.Message):
    r"""The packages that must be installed in order for a worker to
    run the steps of the Cloud Dataflow job that will be assigned to
    its worker pool.

    This is the mechanism by which the Cloud Dataflow SDK causes
    code to be loaded onto the workers. For example, the Cloud
    Dataflow Java SDK might use this to install jars containing the
    user's code and all of the various dependencies (libraries, data
    files, etc.) required in order for that code to run.

    Attributes:
        name (str):
            The name of the package.
        location (str):
            The resource to read the package from. The
            supported resource type is:
            Google Cloud Storage:

              storage.googleapis.com/{bucket}
              bucket.storage.googleapis.com/
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    location: str = proto.Field(
        proto.STRING,
        number=2,
    )


class AutoscalingSettings(proto.Message):
    r"""Settings for WorkerPool autoscaling.

    Attributes:
        algorithm (google.events.cloud.dataflow_v1beta3.types.AutoscalingAlgorithm):
            The algorithm to use for autoscaling.
        max_num_workers (int):
            The maximum number of workers to cap scaling
            at.
    """

    algorithm: 'AutoscalingAlgorithm' = proto.Field(
        proto.ENUM,
        number=1,
        enum='AutoscalingAlgorithm',
    )
    max_num_workers: int = proto.Field(
        proto.INT32,
        number=2,
    )


class SdkHarnessContainerImage(proto.Message):
    r"""Defines an SDK harness container for executing Dataflow
    pipelines.

    Attributes:
        container_image (str):
            A docker container image that resides in
            Google Container Registry.
        use_single_core_per_container (bool):
            If true, recommends the Dataflow service to
            use only one core per SDK container instance
            with this image. If false (or unset) recommends
            using more than one core per SDK container
            instance with this image for efficiency. Note
            that Dataflow service may choose to override
            this property if needed.
        environment_id (str):
            Environment ID for the Beam runner API proto
            Environment that corresponds to the current SDK
            Harness.
        capabilities (MutableSequence[str]):
            The set of capabilities enumerated in the above Environment
            proto. See also
            `beam_runner_api.proto <https://github.com/apache/beam/blob/master/model/pipeline/src/main/proto/org/apache/beam/model/pipeline/v1/beam_runner_api.proto>`__
    """

    container_image: str = proto.Field(
        proto.STRING,
        number=1,
    )
    use_single_core_per_container: bool = proto.Field(
        proto.BOOL,
        number=2,
    )
    environment_id: str = proto.Field(
        proto.STRING,
        number=3,
    )
    capabilities: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=4,
    )


class WorkerPool(proto.Message):
    r"""Describes one particular pool of Cloud Dataflow workers to be
    instantiated by the Cloud Dataflow service in order to perform
    the computations required by a job.  Note that a workflow job
    may use multiple pools, in order to match the various
    computational requirements of the various stages of the job.

    Attributes:
        kind (str):
            The kind of the worker pool; currently only ``harness`` and
            ``shuffle`` are supported.
        num_workers (int):
            Number of Google Compute Engine workers in
            this pool needed to execute the job.  If zero or
            unspecified, the service will attempt to choose
            a reasonable default.
        packages (MutableSequence[google.events.cloud.dataflow_v1beta3.types.Package]):
            Packages to be installed on workers.
        default_package_set (google.events.cloud.dataflow_v1beta3.types.DefaultPackageSet):
            The default package set to install.  This
            allows the service to select a default set of
            packages which are useful to worker harnesses
            written in a particular language.
        machine_type (str):
            Machine type (e.g. "n1-standard-1").  If
            empty or unspecified, the service will attempt
            to choose a reasonable default.
        teardown_policy (google.events.cloud.dataflow_v1beta3.types.TeardownPolicy):
            Sets the policy for determining when to turndown worker
            pool. Allowed values are: ``TEARDOWN_ALWAYS``,
            ``TEARDOWN_ON_SUCCESS``, and ``TEARDOWN_NEVER``.
            ``TEARDOWN_ALWAYS`` means workers are always torn down
            regardless of whether the job succeeds.
            ``TEARDOWN_ON_SUCCESS`` means workers are torn down if the
            job succeeds. ``TEARDOWN_NEVER`` means the workers are never
            torn down.

            If the workers are not torn down by the service, they will
            continue to run and use Google Compute Engine VM resources
            in the user's project until they are explicitly terminated
            by the user. Because of this, Google recommends using the
            ``TEARDOWN_ALWAYS`` policy except for small, manually
            supervised test jobs.

            If unknown or unspecified, the service will attempt to
            choose a reasonable default.
        disk_size_gb (int):
            Size of root disk for VMs, in GB.  If zero or
            unspecified, the service will attempt to choose
            a reasonable default.
        disk_type (str):
            Type of root disk for VMs.  If empty or
            unspecified, the service will attempt to choose
            a reasonable default.
        disk_source_image (str):
            Fully qualified source image for disks.
        zone (str):
            Zone to run the worker pools in.  If empty or
            unspecified, the service will attempt to choose
            a reasonable default.
        on_host_maintenance (str):
            The action to take on host maintenance, as
            defined by the Google Compute Engine API.
        metadata (MutableMapping[str, str]):
            Metadata to set on the Google Compute Engine
            VMs.
        autoscaling_settings (google.events.cloud.dataflow_v1beta3.types.AutoscalingSettings):
            Settings for autoscaling of this WorkerPool.
        network (str):
            Network to which VMs will be assigned.  If
            empty or unspecified, the service will use the
            network "default".
        subnetwork (str):
            Subnetwork to which VMs will be assigned, if
            desired.  Expected to be of the form
            "regions/REGION/subnetworks/SUBNETWORK".
        worker_harness_container_image (str):
            Required. Docker container image that executes the Cloud
            Dataflow worker harness, residing in Google Container
            Registry.

            Deprecated for the Fn API path. Use
            sdk_harness_container_images instead.
        num_threads_per_worker (int):
            The number of threads per worker harness. If
            empty or unspecified, the service will choose a
            number of threads (according to the number of
            cores on the selected machine type for batch, or
            1 by convention for streaming).
        ip_configuration (google.events.cloud.dataflow_v1beta3.types.WorkerIPAddressConfiguration):
            Configuration for VM IPs.
        sdk_harness_container_images (MutableSequence[google.events.cloud.dataflow_v1beta3.types.SdkHarnessContainerImage]):
            Set of SDK harness containers needed to
            execute this pipeline. This will only be set in
            the Fn API path. For non-cross-language
            pipelines this should have only one entry.
            Cross-language pipelines will have two or more
            entries.
    """

    kind: str = proto.Field(
        proto.STRING,
        number=1,
    )
    num_workers: int = proto.Field(
        proto.INT32,
        number=2,
    )
    packages: MutableSequence['Package'] = proto.RepeatedField(
        proto.MESSAGE,
        number=3,
        message='Package',
    )
    default_package_set: 'DefaultPackageSet' = proto.Field(
        proto.ENUM,
        number=4,
        enum='DefaultPackageSet',
    )
    machine_type: str = proto.Field(
        proto.STRING,
        number=5,
    )
    teardown_policy: 'TeardownPolicy' = proto.Field(
        proto.ENUM,
        number=6,
        enum='TeardownPolicy',
    )
    disk_size_gb: int = proto.Field(
        proto.INT32,
        number=7,
    )
    disk_type: str = proto.Field(
        proto.STRING,
        number=16,
    )
    disk_source_image: str = proto.Field(
        proto.STRING,
        number=8,
    )
    zone: str = proto.Field(
        proto.STRING,
        number=9,
    )
    on_host_maintenance: str = proto.Field(
        proto.STRING,
        number=11,
    )
    metadata: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=13,
    )
    autoscaling_settings: 'AutoscalingSettings' = proto.Field(
        proto.MESSAGE,
        number=14,
        message='AutoscalingSettings',
    )
    network: str = proto.Field(
        proto.STRING,
        number=17,
    )
    subnetwork: str = proto.Field(
        proto.STRING,
        number=19,
    )
    worker_harness_container_image: str = proto.Field(
        proto.STRING,
        number=18,
    )
    num_threads_per_worker: int = proto.Field(
        proto.INT32,
        number=20,
    )
    ip_configuration: 'WorkerIPAddressConfiguration' = proto.Field(
        proto.ENUM,
        number=21,
        enum='WorkerIPAddressConfiguration',
    )
    sdk_harness_container_images: MutableSequence['SdkHarnessContainerImage'] = proto.RepeatedField(
        proto.MESSAGE,
        number=22,
        message='SdkHarnessContainerImage',
    )


class DebugOptions(proto.Message):
    r"""Describes any options that have an effect on the debugging of
    pipelines.

    Attributes:
        enable_hot_key_logging (bool):
            When true, enables the logging of the literal
            hot key to the user's Cloud Logging.
    """

    enable_hot_key_logging: bool = proto.Field(
        proto.BOOL,
        number=1,
    )


class Job(proto.Message):
    r"""Defines a job to be run by the Cloud Dataflow service. Do not enter
    confidential information when you supply string values using the
    API. Fields stripped from source Job proto:

    -  steps
    -  pipeline_description
    -  transform_name_mapping

    Attributes:
        id (str):
            The unique ID of this job.

            This field is set by the Cloud Dataflow service
            when the Job is created, and is immutable for
            the life of the job.
        project_id (str):
            The ID of the Cloud Platform project that the
            job belongs to.
        name (str):
            The user-specified Cloud Dataflow job name.

            Only one Job with a given name can exist in a project within
            one region at any given time. Jobs in different regions can
            have the same name. If a caller attempts to create a Job
            with the same name as an already-existing Job, the attempt
            returns the existing Job.

            The name must match the regular expression
            ``[a-z]([-a-z0-9]{0,1022}[a-z0-9])?``
        type_ (google.events.cloud.dataflow_v1beta3.types.JobType):
            The type of Cloud Dataflow job.
        environment (google.events.cloud.dataflow_v1beta3.types.Environment):
            The environment for the job.
        steps_location (str):
            The Cloud Storage location where the steps
            are stored.
        current_state (google.events.cloud.dataflow_v1beta3.types.JobState):
            The current state of the job.

            Jobs are created in the ``JOB_STATE_STOPPED`` state unless
            otherwise specified.

            A job in the ``JOB_STATE_RUNNING`` state may asynchronously
            enter a terminal state. After a job has reached a terminal
            state, no further state updates may be made.

            This field may be mutated by the Cloud Dataflow service;
            callers cannot mutate it.
        current_state_time (google.protobuf.timestamp_pb2.Timestamp):
            The timestamp associated with the current
            state.
        requested_state (google.events.cloud.dataflow_v1beta3.types.JobState):
            The job's requested state.

            ``UpdateJob`` may be used to switch between the
            ``JOB_STATE_STOPPED`` and ``JOB_STATE_RUNNING`` states, by
            setting requested_state. ``UpdateJob`` may also be used to
            directly set a job's requested state to
            ``JOB_STATE_CANCELLED`` or ``JOB_STATE_DONE``, irrevocably
            terminating the job if it has not already reached a terminal
            state.
        execution_info (google.events.cloud.dataflow_v1beta3.types.JobExecutionInfo):
            Deprecated.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            The timestamp when the job was initially
            created. Immutable and set by the Cloud Dataflow
            service.
        replace_job_id (str):
            If this job is an update of an existing job, this field is
            the job ID of the job it replaced.

            When sending a ``CreateJobRequest``, you can update a job by
            specifying it here. The job named here is stopped, and its
            intermediate state is transferred to this job.
        client_request_id (str):
            The client's unique identifier of the job,
            re-used across retried attempts. If this field
            is set, the service will ensure its uniqueness.
            The request to create a job will fail if the
            service has knowledge of a previously submitted
            job with the same client's ID and job name. The
            caller may use this field to ensure idempotence
            of job creation across retried attempts to
            create a job. By default, the field is empty
            and, in that case, the service ignores it.
        replaced_by_job_id (str):
            If another job is an update of this job (and thus, this job
            is in ``JOB_STATE_UPDATED``), this field contains the ID of
            that job.
        temp_files (MutableSequence[str]):
            A set of files the system should be aware of
            that are used for temporary storage. These
            temporary files will be removed on job
            completion.
            No duplicates are allowed.
            No file patterns are supported.

            The supported files are:

            Google Cloud Storage:

               storage.googleapis.com/{bucket}/{object}
               bucket.storage.googleapis.com/{object}
        labels (MutableMapping[str, str]):
            User-defined labels for this job.

            The labels map can contain no more than 64 entries. Entries
            of the labels map are UTF8 strings that comply with the
            following restrictions:

            -  Keys must conform to regexp:
               [\\p{Ll}\\p{Lo}][\\p{Ll}\\p{Lo}\\p{N}_-]{0,62}
            -  Values must conform to regexp:
               [\\p{Ll}\\p{Lo}\\p{N}_-]{0,63}
            -  Both keys and values are additionally constrained to be
               <= 128 bytes in size.
        location (str):
            The [regional endpoint]
            (https://cloud.google.com/dataflow/docs/concepts/regional-endpoints)
            that contains this job.
        stage_states (MutableSequence[google.events.cloud.dataflow_v1beta3.types.ExecutionStageState]):
            This field may be mutated by the Cloud
            Dataflow service; callers cannot mutate it.
        job_metadata (google.events.cloud.dataflow_v1beta3.types.JobMetadata):
            This field is populated by the Dataflow
            service to support filtering jobs by the
            metadata values provided here. Populated for
            ListJobs and all GetJob views SUMMARY and
            higher.
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            The timestamp when the job was started (transitioned to
            JOB_STATE_PENDING). Flexible resource scheduling jobs are
            started with some delay after job creation, so start_time is
            unset before start and is updated when the job is started by
            the Cloud Dataflow service. For other jobs, start_time
            always equals to create_time and is immutable and set by the
            Cloud Dataflow service.
        created_from_snapshot_id (str):
            If this is specified, the job's initial state
            is populated from the given snapshot.
        satisfies_pzs (bool):
            Reserved for future use. This field is set
            only in responses from the server; it is ignored
            if it is set in any requests.
    """

    id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    project_id: str = proto.Field(
        proto.STRING,
        number=2,
    )
    name: str = proto.Field(
        proto.STRING,
        number=3,
    )
    type_: 'JobType' = proto.Field(
        proto.ENUM,
        number=4,
        enum='JobType',
    )
    environment: 'Environment' = proto.Field(
        proto.MESSAGE,
        number=5,
        message='Environment',
    )
    steps_location: str = proto.Field(
        proto.STRING,
        number=24,
    )
    current_state: 'JobState' = proto.Field(
        proto.ENUM,
        number=7,
        enum='JobState',
    )
    current_state_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=8,
        message=timestamp_pb2.Timestamp,
    )
    requested_state: 'JobState' = proto.Field(
        proto.ENUM,
        number=9,
        enum='JobState',
    )
    execution_info: 'JobExecutionInfo' = proto.Field(
        proto.MESSAGE,
        number=10,
        message='JobExecutionInfo',
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=11,
        message=timestamp_pb2.Timestamp,
    )
    replace_job_id: str = proto.Field(
        proto.STRING,
        number=12,
    )
    client_request_id: str = proto.Field(
        proto.STRING,
        number=14,
    )
    replaced_by_job_id: str = proto.Field(
        proto.STRING,
        number=15,
    )
    temp_files: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=16,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=17,
    )
    location: str = proto.Field(
        proto.STRING,
        number=18,
    )
    stage_states: MutableSequence['ExecutionStageState'] = proto.RepeatedField(
        proto.MESSAGE,
        number=20,
        message='ExecutionStageState',
    )
    job_metadata: 'JobMetadata' = proto.Field(
        proto.MESSAGE,
        number=21,
        message='JobMetadata',
    )
    start_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=22,
        message=timestamp_pb2.Timestamp,
    )
    created_from_snapshot_id: str = proto.Field(
        proto.STRING,
        number=23,
    )
    satisfies_pzs: bool = proto.Field(
        proto.BOOL,
        number=25,
    )


class DatastoreIODetails(proto.Message):
    r"""Metadata for a Datastore connector used by the job.

    Attributes:
        namespace (str):
            Namespace used in the connection.
        project_id (str):
            ProjectId accessed in the connection.
    """

    namespace: str = proto.Field(
        proto.STRING,
        number=1,
    )
    project_id: str = proto.Field(
        proto.STRING,
        number=2,
    )


class PubSubIODetails(proto.Message):
    r"""Metadata for a Pub/Sub connector used by the job.

    Attributes:
        topic (str):
            Topic accessed in the connection.
        subscription (str):
            Subscription used in the connection.
    """

    topic: str = proto.Field(
        proto.STRING,
        number=1,
    )
    subscription: str = proto.Field(
        proto.STRING,
        number=2,
    )


class FileIODetails(proto.Message):
    r"""Metadata for a File connector used by the job.

    Attributes:
        file_pattern (str):
            File Pattern used to access files by the
            connector.
    """

    file_pattern: str = proto.Field(
        proto.STRING,
        number=1,
    )


class BigTableIODetails(proto.Message):
    r"""Metadata for a Cloud Bigtable connector used by the job.

    Attributes:
        project_id (str):
            ProjectId accessed in the connection.
        instance_id (str):
            InstanceId accessed in the connection.
        table_id (str):
            TableId accessed in the connection.
    """

    project_id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    instance_id: str = proto.Field(
        proto.STRING,
        number=2,
    )
    table_id: str = proto.Field(
        proto.STRING,
        number=3,
    )


class BigQueryIODetails(proto.Message):
    r"""Metadata for a BigQuery connector used by the job.

    Attributes:
        table (str):
            Table accessed in the connection.
        dataset (str):
            Dataset accessed in the connection.
        project_id (str):
            Project accessed in the connection.
        query (str):
            Query used to access data in the connection.
    """

    table: str = proto.Field(
        proto.STRING,
        number=1,
    )
    dataset: str = proto.Field(
        proto.STRING,
        number=2,
    )
    project_id: str = proto.Field(
        proto.STRING,
        number=3,
    )
    query: str = proto.Field(
        proto.STRING,
        number=4,
    )


class SpannerIODetails(proto.Message):
    r"""Metadata for a Spanner connector used by the job.

    Attributes:
        project_id (str):
            ProjectId accessed in the connection.
        instance_id (str):
            InstanceId accessed in the connection.
        database_id (str):
            DatabaseId accessed in the connection.
    """

    project_id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    instance_id: str = proto.Field(
        proto.STRING,
        number=2,
    )
    database_id: str = proto.Field(
        proto.STRING,
        number=3,
    )


class SdkVersion(proto.Message):
    r"""The version of the SDK used to run the job.

    Attributes:
        version (str):
            The version of the SDK used to run the job.
        version_display_name (str):
            A readable string describing the version of
            the SDK.
        sdk_support_status (google.events.cloud.dataflow_v1beta3.types.SdkVersion.SdkSupportStatus):
            The support status for this SDK version.
    """
    class SdkSupportStatus(proto.Enum):
        r"""The support status of the SDK used to run the job.

        Values:
            UNKNOWN (0):
                Cloud Dataflow is unaware of this version.
            SUPPORTED (1):
                This is a known version of an SDK, and is
                supported.
            STALE (2):
                A newer version of the SDK family exists, and
                an update is recommended.
            DEPRECATED (3):
                This version of the SDK is deprecated and
                will eventually be unsupported.
            UNSUPPORTED (4):
                Support for this SDK version has ended and it
                should no longer be used.
        """
        UNKNOWN = 0
        SUPPORTED = 1
        STALE = 2
        DEPRECATED = 3
        UNSUPPORTED = 4

    version: str = proto.Field(
        proto.STRING,
        number=1,
    )
    version_display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    sdk_support_status: SdkSupportStatus = proto.Field(
        proto.ENUM,
        number=3,
        enum=SdkSupportStatus,
    )


class JobMetadata(proto.Message):
    r"""Metadata available primarily for filtering jobs. Will be
    included in the ListJob response and Job SUMMARY view.

    Attributes:
        sdk_version (google.events.cloud.dataflow_v1beta3.types.SdkVersion):
            The SDK version used to run the job.
        spanner_details (MutableSequence[google.events.cloud.dataflow_v1beta3.types.SpannerIODetails]):
            Identification of a Spanner source used in
            the Dataflow job.
        bigquery_details (MutableSequence[google.events.cloud.dataflow_v1beta3.types.BigQueryIODetails]):
            Identification of a BigQuery source used in
            the Dataflow job.
        big_table_details (MutableSequence[google.events.cloud.dataflow_v1beta3.types.BigTableIODetails]):
            Identification of a Cloud Bigtable source
            used in the Dataflow job.
        pubsub_details (MutableSequence[google.events.cloud.dataflow_v1beta3.types.PubSubIODetails]):
            Identification of a Pub/Sub source used in
            the Dataflow job.
        file_details (MutableSequence[google.events.cloud.dataflow_v1beta3.types.FileIODetails]):
            Identification of a File source used in the
            Dataflow job.
        datastore_details (MutableSequence[google.events.cloud.dataflow_v1beta3.types.DatastoreIODetails]):
            Identification of a Datastore source used in
            the Dataflow job.
    """

    sdk_version: 'SdkVersion' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='SdkVersion',
    )
    spanner_details: MutableSequence['SpannerIODetails'] = proto.RepeatedField(
        proto.MESSAGE,
        number=2,
        message='SpannerIODetails',
    )
    bigquery_details: MutableSequence['BigQueryIODetails'] = proto.RepeatedField(
        proto.MESSAGE,
        number=3,
        message='BigQueryIODetails',
    )
    big_table_details: MutableSequence['BigTableIODetails'] = proto.RepeatedField(
        proto.MESSAGE,
        number=4,
        message='BigTableIODetails',
    )
    pubsub_details: MutableSequence['PubSubIODetails'] = proto.RepeatedField(
        proto.MESSAGE,
        number=5,
        message='PubSubIODetails',
    )
    file_details: MutableSequence['FileIODetails'] = proto.RepeatedField(
        proto.MESSAGE,
        number=6,
        message='FileIODetails',
    )
    datastore_details: MutableSequence['DatastoreIODetails'] = proto.RepeatedField(
        proto.MESSAGE,
        number=7,
        message='DatastoreIODetails',
    )


class ExecutionStageState(proto.Message):
    r"""A message describing the state of a particular execution
    stage.

    Attributes:
        execution_stage_name (str):
            The name of the execution stage.
        execution_stage_state (google.events.cloud.dataflow_v1beta3.types.JobState):
            Executions stage states allow the same set of
            values as JobState.
        current_state_time (google.protobuf.timestamp_pb2.Timestamp):
            The time at which the stage transitioned to
            this state.
    """

    execution_stage_name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    execution_stage_state: 'JobState' = proto.Field(
        proto.ENUM,
        number=2,
        enum='JobState',
    )
    current_state_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )


class JobExecutionInfo(proto.Message):
    r"""Additional information about how a Cloud Dataflow job will be
    executed that isn't contained in the submitted job.

    Attributes:
        stages (MutableMapping[str, google.events.cloud.dataflow_v1beta3.types.JobExecutionStageInfo]):
            A mapping from each stage to the information
            about that stage.
    """

    stages: MutableMapping[str, 'JobExecutionStageInfo'] = proto.MapField(
        proto.STRING,
        proto.MESSAGE,
        number=1,
        message='JobExecutionStageInfo',
    )


class JobExecutionStageInfo(proto.Message):
    r"""Contains information about how a particular
    [google.dataflow.v1beta3.Step][google.dataflow.v1beta3.Step] will be
    executed.

    Attributes:
        step_name (MutableSequence[str]):
            The steps associated with the execution
            stage. Note that stages may have several steps,
            and that a given step might be run by more than
            one stage.
    """

    step_name: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=1,
    )


class JobEventData(proto.Message):
    r"""The data within all Job events.

    Attributes:
        payload (google.events.cloud.dataflow_v1beta3.types.Job):
            The Job event payload.
    """

    payload: 'Job' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='Job',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
