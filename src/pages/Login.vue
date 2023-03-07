<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">系统登录</h3>
        <div class="login_header">
          <a @click="cur = false" :class="{ active: cur == false }">密码登录</a>
          <a @click="cur = true" :class="{ active: cur == true }">短信登录</a>
        </div>
      </div>
      <div class="login_content">
        <!-- 在cur==0时此板块显示 其他时候此板块不显示 -->
        <div v-show="cur == false" class="Cbody_item">
          <el-form-item prop="mobile">
            <span class="svg-container">
              <icon class="header-icon" name="user" />
            </span>
            <el-input
              ref="mobile"
              v-model="loginForm.mobile"
              placeholder="请输入手机号/用户名"
              name="mobile"
              type="text"
              tabindex="1"
              auto-complete="on"
            />
          </el-form-item>

          <el-form-item prop="password">
            <span class="svg-container">
              <icon class="header-icon" name="password" />
            </span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="请输入密码"
              name="password"
              tabindex="2"
              auto-complete="on"
              @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd" @click="showPwd">
              <icon class="header-icon" :name="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
        </div>
        <!-- 在cur==1时此板块显示 其他时候此板块不显示 -->
        <div v-show="cur == true" class="Cbody_item">
          <el-form-item prop="mobile">
            <span class="svg-container">
              <icon class="header-icon" name="user" />
            </span>
            <el-input
              ref="mobileSignin"
              v-model="loginForm.mobileSignin"
              placeholder="请输入手机号"
              name="mobileSignin"
              type="text"
              tabindex="1"
              auto-complete="on"
            />
          </el-form-item>
          <el-form-item prop="code">
            <span class="svg-container">
              <icon class="header-icon" name="password" />
            </span>
            <el-input
              ref="code"
              v-model="loginForm.code"
              type="text"
              placeholder="请输入验证码"
              name="code"
              abindex="2"
              maxlength="6"
              auto-complete="on"
              @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd">
              <el-button
                :loading="sending"
                :disabled="sendDisabled"
                size="small"
                @click="onSendSms"
                >{{ sendButtonText }}</el-button
              >
            </span>
          </el-form-item>
        </div>
      </div>
      <el-button
        :loading="loading"
        type="primary"
        style="width: 100%; margin-bottom: 30px"
        @click.native.prevent="handleLogin"
        >登录</el-button
      >
    </el-form>
  </div>
</template>

<script>
import $api from "@/api/user";

export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        mobile: "", // 手机号
        mobileSignin: "", // 手机号
        code: "", // 验证码
        password: "", //密码
      },
      cur: false, //true代表短信, false代表密码
      sending: false,
      dealLogin: false,
      sendDisabled: false,
      loading: false,
      timer: 0,
      passwordType: "password",
      redirect: undefined,
    };
  },
  computed: {
    sendButtonText() {
      if (this.timer === 0) {
        return "发送验证码";
      } else {
        return `${this.timer}秒后重发`;
      }
    },
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
    timer(num) {
      if (num > 0) {
        setTimeout(() => {
          this.timer = --num;
        }, 1000);
      }
    },
  },
  created() {
    const token = localStorage.getItem('token');
    if (token) {
      this.$message.success("您已登录");
      this.$router.push({
        path: this.redirect || "/"
      });
    }
  },

  methods: {
    onSendSms() {
      this.loginWay = false;
      let mobileSignin = this.loginForm.mobileSignin;
      let checkMobile = this.checkMobile(mobileSignin);
      if (!checkMobile) {
        this.$message.error("请输入正确的手机号");
        return;
      }

      this.sending = true;

      sendSms({ mobile: mobileSignin })
        .then((response) => {
          this.$message.success("短信发送成功，请注意查收");
          Cookie.set("last-send-time", new Date());
          this.timer = 60;
        })
        .catch((e) => {
          this.$message.error("网络异常");
          console.log(e);
        })
        .finally(() => (this.sending = false));
    },
    checkMobile(mobile) {
      if (!mobile) {
        return false;
      }
      const reg = /^1[3|4|5|7|8][0-9]\d{8}$/;
      if (!reg.test(mobile)) {
        this.$message.error("请输入正确的手机号");
        return false;
      }
      return true;
    },
    showPwd() {
      this.loginWay = true;
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      //this.loading = true;
      let mobile = "";
      let sendData = {};
      if (this.cur) {
        mobile = this.loginForm.mobileSignin;
        let checkMobile = this.checkMobile(mobile);
        if (!checkMobile) {
          this.$message.error("请输入正确的手机号");
          return;
        }
        let code = this.loginForm.code;
        if (!code) {
          this.$message.error("请输入验证码");
          return;
        }
        sendData = { mobile: mobile, code: code };
      } else {
        mobile = this.loginForm.mobile;
        let password = this.loginForm.password;
        if (!password) {
          this.$message.error("请输入密码");
          return;
        }
        sendData = { name: mobile, password: password };
      }

      $api.login(sendData)
        .then((response) => {
          this.loading = false;

          let userData = response;

          localStorage.setItem('token', userData.access_token)
          localStorage.setItem('userInfo', JSON.stringify(userData.user))

          this.$message.success("登录成功");

          this.$router.push({
            path: this.redirect || "/"
          });
        })
        .catch(e => {
          this.loading = false;
          this.$message.error("网络异常");
          //this.$router.go({ path: this.redirect || '/', query: this.otherQuery })
          console.log(e);
        })
        .finally(() => (this.sending = false));
    },
  },
};
</script>
<style>
.login_header a {
  color: #fff;
  margin: 50px;
}
.login_header {
  margin-bottom: 30px;
  text-align: center;
}
.login_header span {
  margin-right: 20px;
  cursor: pointer;
}
.Cbody_item {
  border: 0px solid #999;
  overflow: hidden;
}
.active {
  color: #fff;
  padding-bottom: 10px;
  border-bottom: 3px solid #fff;
}
</style>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
