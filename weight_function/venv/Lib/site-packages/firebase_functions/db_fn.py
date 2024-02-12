# Copyright 2022 Google Inc.
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
"""
Module for Cloud Functions that are triggered by the Firebase Realtime Database.
"""
# pylint: disable=protected-access
import dataclasses as _dataclass
import functools as _functools
import typing as _typing
import datetime as _dt
import firebase_functions.private.util as _util
import firebase_functions.private.path_pattern as _path_pattern
import firebase_functions.core as _core
import cloudevents.http as _ce

from firebase_functions.options import DatabaseOptions
from firebase_functions.core import Change, T

_event_type_written = "google.firebase.database.ref.v1.written"
_event_type_created = "google.firebase.database.ref.v1.created"
_event_type_updated = "google.firebase.database.ref.v1.updated"
_event_type_deleted = "google.firebase.database.ref.v1.deleted"


@_dataclass.dataclass(frozen=True)
class Event(_core.CloudEvent[T]):
    """
    A CloudEvent that contains a DataSnapshot or a Change<DataSnapshot>.
    """

    firebase_database_host: str
    """
    The domain of the database instance.
    """

    instance: str
    """
    The instance ID portion of the fully qualified resource name.
    """

    reference: str
    """
    The database reference path.
    """

    location: str
    """
    The location of the database
    """

    params: dict[str, str]
    """
    An dict containing the values of the path patterns.
    Only named capture groups are populated - {key}, {key=*}, {key=**}
    """


_E1 = Event[Change[_typing.Any | None]]
_E2 = Event[_typing.Any | None]
_C1 = _typing.Callable[[_E1], None]
_C2 = _typing.Callable[[_E2], None]


def _db_endpoint_handler(
    func: _C1 | _C2,
    event_type: str,
    ref_pattern: _path_pattern.PathPattern,
    instance_pattern: _path_pattern.PathPattern,
    raw: _ce.CloudEvent,
) -> None:
    event_attributes = raw._get_attributes()
    event_data: _typing.Any = raw.get_data()
    database_event_data = event_data
    if event_type == _event_type_deleted:
        database_event_data = database_event_data["data"]
    if event_type == _event_type_created:
        database_event_data = database_event_data["delta"]
    if event_type in (_event_type_written, _event_type_updated):
        before = event_data["data"]
        after = event_data["delta"]
        # Merge delta into data to generate an 'after' view of the data.
        if isinstance(before, dict) and isinstance(after, dict):
            after = _util.prune_nones(_util.deep_merge(before, after))
        database_event_data = Change(
            before=before,
            after=after,
        )
    event_instance = event_attributes["instance"]
    event_ref = event_attributes["ref"]
    params: dict[str, str] = {
        **ref_pattern.extract_matches(event_ref),
        **instance_pattern.extract_matches(event_instance),
    }
    database_event = Event(
        firebase_database_host=event_attributes["firebasedatabasehost"],
        instance=event_instance,
        reference=event_ref,
        location=event_attributes["location"],
        specversion=event_attributes["specversion"],
        id=event_attributes["id"],
        source=event_attributes["source"],
        type=event_attributes["type"],
        time=_dt.datetime.strptime(
            event_attributes["time"],
            "%Y-%m-%dT%H:%M:%S.%f%z",
        ),
        data=database_event_data,
        subject=event_attributes["subject"],
        params=params,
    )
    func(database_event)


@_util.copy_func_kwargs(DatabaseOptions)
def on_value_written(**kwargs) -> _typing.Callable[[_C1], _C1]:
    """
    Event handler which triggers when data is created, updated, or deleted in Realtime Database.

    Example:

    .. code-block:: python

      @on_value_written(reference="*")
      def example(event: Event[Change[object]]) -> None:
          pass

    :param \\*\\*kwargs: Database options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.DatabaseOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.db_fn.Event` \\[
            :exc:`firebase_functions.core.Change` \\] \\], `None` \\]
            A function that takes a Database Event and returns None.
    """
    options = DatabaseOptions(**kwargs)

    def on_value_written_inner_decorator(func: _C1):
        ref_pattern = _path_pattern.PathPattern(options.reference)
        instance_pattern = _path_pattern.PathPattern(
            options.instance if options.instance is not None else "*")

        @_functools.wraps(func)
        def on_value_written_wrapped(raw: _ce.CloudEvent):
            return _db_endpoint_handler(
                func,
                _event_type_written,
                ref_pattern,
                instance_pattern,
                raw,
            )

        _util.set_func_endpoint_attr(
            on_value_written_wrapped,
            options._endpoint(
                event_type=_event_type_written,
                func_name=func.__name__,
                instance_pattern=instance_pattern,
            ),
        )
        return on_value_written_wrapped

    return on_value_written_inner_decorator


@_util.copy_func_kwargs(DatabaseOptions)
def on_value_updated(**kwargs) -> _typing.Callable[[_C1], _C1]:
    """
    Event handler which triggers when data is updated in Realtime Database.

    Example:

    .. code-block:: python

      @on_value_updated(reference="*")
      def example(event: Event[Change[object]]) -> None:
          pass

    :param \\*\\*kwargs: Database options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.DatabaseOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.db_fn.Event` \\[
            :exc:`firebase_functions.core.Change` \\] \\], `None` \\]
            A function that takes a Database Event and returns None.
    """
    options = DatabaseOptions(**kwargs)

    def on_value_updated_inner_decorator(func: _C1):
        ref_pattern = _path_pattern.PathPattern(options.reference)
        instance_pattern = _path_pattern.PathPattern(
            options.instance if options.instance is not None else "*")

        @_functools.wraps(func)
        def on_value_updated_wrapped(raw: _ce.CloudEvent):
            return _db_endpoint_handler(
                func,
                _event_type_updated,
                ref_pattern,
                instance_pattern,
                raw,
            )

        _util.set_func_endpoint_attr(
            on_value_updated_wrapped,
            options._endpoint(
                event_type=_event_type_updated,
                func_name=func.__name__,
                instance_pattern=instance_pattern,
            ),
        )
        return on_value_updated_wrapped

    return on_value_updated_inner_decorator


@_util.copy_func_kwargs(DatabaseOptions)
def on_value_created(**kwargs) -> _typing.Callable[[_C2], _C2]:
    """
    Event handler which triggers when data is created in Realtime Database.

    Example:

    .. code-block:: python

        @on_value_created(reference="*")
        def example(event: Event[object]):
          pass

    :param \\*\\*kwargs: Database options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.DatabaseOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.db_fn.Event` \\[
            :exc:`object` \\] \\], `None` \\]
            A function that takes a Database Event and returns None.
    """
    options = DatabaseOptions(**kwargs)

    def on_value_created_inner_decorator(func: _C2):
        ref_pattern = _path_pattern.PathPattern(options.reference)
        instance_pattern = _path_pattern.PathPattern(
            options.instance if options.instance is not None else "*")

        @_functools.wraps(func)
        def on_value_created_wrapped(raw: _ce.CloudEvent):
            return _db_endpoint_handler(
                func,
                _event_type_created,
                ref_pattern,
                instance_pattern,
                raw,
            )

        _util.set_func_endpoint_attr(
            on_value_created_wrapped,
            options._endpoint(
                event_type=_event_type_created,
                func_name=func.__name__,
                instance_pattern=instance_pattern,
            ),
        )
        return on_value_created_wrapped

    return on_value_created_inner_decorator


@_util.copy_func_kwargs(DatabaseOptions)
def on_value_deleted(**kwargs) -> _typing.Callable[[_C2], _C2]:
    """
    Event handler which triggers when data is deleted in Realtime Database.

    Example:

    .. code-block:: python

      @on_value_deleted(reference="*")
      def example(event: Event[object]) -> None:
          pass

    :param \\*\\*kwargs: Database options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.DatabaseOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.db_fn.Event` \\[
            :exc:`object` \\] \\], `None` \\]
            A function that takes a Database Event and returns None.
    """
    options = DatabaseOptions(**kwargs)

    def on_value_deleted_inner_decorator(func: _C2):
        ref_pattern = _path_pattern.PathPattern(options.reference)
        instance_pattern = _path_pattern.PathPattern(
            options.instance if options.instance is not None else "*")

        @_functools.wraps(func)
        def on_value_deleted_wrapped(raw: _ce.CloudEvent):
            return _db_endpoint_handler(
                func,
                _event_type_deleted,
                ref_pattern,
                instance_pattern,
                raw,
            )

        _util.set_func_endpoint_attr(
            on_value_deleted_wrapped,
            options._endpoint(
                event_type=_event_type_deleted,
                func_name=func.__name__,
                instance_pattern=instance_pattern,
            ),
        )
        return on_value_deleted_wrapped

    return on_value_deleted_inner_decorator
