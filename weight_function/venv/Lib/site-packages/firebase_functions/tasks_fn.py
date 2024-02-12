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
"""Cloud functions to handle Tasks enqueued with Google Cloud Tasks."""

# pylint: disable=protected-access
import typing as _typing
import functools as _functools

from flask import Request, Response

import firebase_functions.options as _options
import firebase_functions.private.util as _util
from firebase_functions.https_fn import CallableRequest, _on_call_handler

_C = _typing.Callable[[CallableRequest[_typing.Any]], _typing.Any]


@_util.copy_func_kwargs(_options.TaskQueueOptions)
def on_task_dispatched(**kwargs) -> _typing.Callable[[_C], Response]:
    """
    Creates a handler for tasks sent to a Google Cloud Tasks queue.
    Requires a function that takes a CallableRequest.

    Example:

    .. code-block:: python

      @tasks.on_task_dispatched()
      def example(request: tasks.CallableRequest) -> Any:
          return "Hello World"

    :param \\*\\*kwargs: TaskQueueOptions options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.TaskQueueOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.https.CallableRequest` \\[
            :exc:`object` \\] \\], :exc:`object` \\]
            A function that takes a CallableRequest and returns an :exc:`object`.
    """
    options = _options.TaskQueueOptions(**kwargs)

    def on_task_dispatched_decorator(func: _C):

        @_functools.wraps(func)
        def on_task_dispatched_wrapped(request: Request) -> Response:
            return _on_call_handler(func, request, enforce_app_check=False)

        _util.set_func_endpoint_attr(
            on_task_dispatched_wrapped,
            options._endpoint(func_name=func.__name__),
        )
        _util.set_required_apis_attr(
            on_task_dispatched_wrapped,
            options._required_apis(),
        )
        return on_task_dispatched_wrapped

    return on_task_dispatched_decorator
