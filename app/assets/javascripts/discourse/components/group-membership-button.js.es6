import Component from "@ember/component";
import { default as computed } from "ember-addons/ember-computed-decorators";
import { popupAjaxError } from "discourse/lib/ajax-error";
import showModal from "discourse/lib/show-modal";

export default Component.extend({
  classNames: ["group-membership-button"],

  @computed("model.public_admission", "userIsGroupUser")
  canJoinGroup(publicAdmission, userIsGroupUser) {
    return publicAdmission && !userIsGroupUser;
  },

  @computed("model.public_exit", "userIsGroupUser")
  canLeaveGroup(publicExit, userIsGroupUser) {
    return publicExit && userIsGroupUser;
  },

  @computed("model.allow_membership_requests", "userIsGroupUser")
  canRequestMembership(allowMembershipRequests, userIsGroupUser) {
    return allowMembershipRequests && !userIsGroupUser;
  },

  @computed("model.is_group_user")
  userIsGroupUser(isGroupUser) {
    return !!isGroupUser;
  },

  _showLoginModal() {
    this.showLogin();
    $.cookie("destination_url", window.location.href);
  },

  actions: {
    joinGroup() {
      if (this.currentUser) {
        this.set("updatingMembership", true);
        const model = this.model;

        model
          .addMembers(this.currentUser.get("username"))
          .then(() => {
            model.set("is_group_user", true);
          })
          .catch(popupAjaxError)
          .finally(() => {
            this.set("updatingMembership", false);
          });
      } else {
        this._showLoginModal();
      }
    },

    leaveGroup() {
      this.set("updatingMembership", true);
      const model = this.model;

      model
        .removeMember(this.currentUser)
        .then(() => {
          model.set("is_group_user", false);
        })
        .catch(popupAjaxError)
        .finally(() => {
          this.set("updatingMembership", false);
        });
    },

    showRequestMembershipForm() {
      if (this.currentUser) {
        showModal("request-group-membership-form", {
          model: this.model
        });
      } else {
        this._showLoginModal();
      }
    }
  }
});
