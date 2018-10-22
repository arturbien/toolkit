/*
Copyright 2017-2018 Opera Software AS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

{
  class Lifecycle {

    /*
     * onCreated(),
     * onAttached(),
     * onPropsReceived(nextProps),
     * onUpdated(prevProps),
     * onDestroyed(),
     * onDetached()
     */

    static onComponentCreated(component) {
      if (component.hasOwnMethod('onCreated')) {
        component.onCreated.call(component.sandbox);
      }
      if (component.child) {
        this.onNodeCreated(component.child);
      }
    }

    static onElementCreated(element) {
      if (element.children) {
        for (const child of element.children) {
          this.onNodeCreated(child);
        }
      }
    }

    static onNodeCreated(node) {
      if (node.isElement()) {
        return this.onElementCreated(node);
      }
      if (!node.isRoot()) {
        return this.onComponentCreated(node);
      }
    }

    static onRootCreated(root) {
      if (root.hasOwnMethod('onCreated')) {
        root.onCreated.call(root.sandbox);
      }
    }

    static onComponentAttached(component) {
      if (component.child) {
        this.onNodeAttached(component.child);
      }
      if (component.hasOwnMethod('onAttached')) {
        component.onAttached.call(component.sandbox);
      }
    }

    static onElementAttached(element) {
      if (element.children) {
        for (const child of element.children) {
          this.onNodeAttached(child);
        }
      }
    }

    static onNodeAttached(node) {
      if (node.isElement()) {
        return this.onElementAttached(node);
      }
      if (!node.isRoot()) {
        return this.onComponentAttached(node);
      }
    }

    static onNodeReceivedDescription(node, description) {
      if (node.isComponent()) {
        this.onComponentReceivedProps(node, description.props);
      }
    }

    static onNodeUpdated(node, prevDescription) {
      if (node.isComponent()) {
        this.onComponentUpdated(node, prevDescription.props);
      }
    }

    static onRootAttached(root) {
      if (root.hasOwnMethod('onAttached')) {
        root.onAttached.call(root.sandbox);
      }
    }

    static onComponentReceivedProps(component, nextProps = {}) {
      if (component.hasOwnMethod('onPropsReceived')) {
        component.onPropsReceived.call(component.sandbox, nextProps);
      }
    }

    static onComponentUpdated(component, prevProps = {}) {
      if (component.hasOwnMethod('onUpdated')) {
        component.onUpdated.call(component.sandbox, prevProps);
      }
    }

    static onComponentDestroyed(component) {
      component.destroy();
      if (component.hasOwnMethod('onDestroyed')) {
        component.onDestroyed.call(component.sandbox);
      }
      if (component.child) {
        this.onNodeDestroyed(component.child);
      }
    }

    static onElementDestroyed(element) {
      if (element.children) {
        for (const child of element.children) {
          this.onNodeDestroyed(child);
        }
      }
    }

    static onNodeDestroyed(node) {
      if (node.isElement()) {
        return this.onElementDestroyed(node);
      }
      if (!node.isRoot()) {
        return this.onComponentDestroyed(node);
      }
    }

    static onComponentDetached(component) {
      if (component.child) {
        this.onNodeDetached(component.child);
      }
      if (component.hasOwnMethod('onDetached')) {
        component.onDetached.call(component.sandbox);
      }
    }

    static onElementDetached(element) {
      if (element.children) {
        for (const child of element.children) {
          this.onNodeDetached(child);
        }
      }
    }

    static onNodeDetached(node) {
      if (node.isElement()) {
        return this.onElementDetached(node);
      }
      if (!node.isRoot()) {
        return this.onComponentDetached(node);
      }
    }

    static beforePatchApplied(patch) {
      const Type = opr.Toolkit.Patch.Type;
      switch (patch.type) {
        case Type.APPEND_CHILD:
          return this.onNodeCreated(patch.child);
        case Type.INIT_ROOT_COMPONENT:
          return this.onRootCreated(patch.root);
        case Type.INSERT_CHILD_NODE:
          return this.onNodeCreated(patch.node);
        case Type.REMOVE_CHILD_NODE:
          return this.onNodeDestroyed(patch.node);
        case Type.REMOVE_CHILD:
          return this.onNodeDestroyed(patch.child);
        case Type.REPLACE_CHILD:
          this.onNodeDestroyed(patch.child);
          this.onNodeCreated(patch.node);
          return;
        case Type.UPDATE_NODE:
          return this.onNodeReceivedDescription(patch.node, patch.description);
      }
    }

    static beforeUpdate(patches) {
      for (const patch of patches) {
        this.beforePatchApplied(patch);
      }
    }

    static afterPatchApplied(patch) {
      const Type = opr.Toolkit.Patch.Type;
      switch (patch.type) {
        case Type.APPEND_CHILD:
          return this.onNodeAttached(patch.child);
        case Type.INIT_ROOT_COMPONENT:
          return this.onRootAttached(patch.root);
        case Type.INSERT_CHILD_NODE:
          return this.onNodeAttached(patch.node);
        case Type.REMOVE_CHILD_NODE:
          return this.onNodeDetached(patch.node);
        case Type.REMOVE_CHILD:
          return this.onNodeDetached(patch.child);
        case Type.REPLACE_CHILD:
          this.onNodeDetached(patch.child);
          this.onNodeAttached(patch.node);
          return;
        case Type.UPDATE_NODE:
          return this.onNodeUpdated(patch.node, patch.prevDescription);
      }
    }

    static afterUpdate(patches) {
      patches = [...patches].reverse();
      for (const patch of patches) {
        this.afterPatchApplied(patch);
      }
    }
  }

  module.exports = Lifecycle;
}
