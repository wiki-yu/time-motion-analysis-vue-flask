<template>
  <div class="reg-login">
    <div v-if="!registerOn"> 
      <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
        <FormItem prop="userName">
          <Input v-model="form.userName" placeholder="Please input the user name">
            <span slot="prepend">
              <Icon :size="16" type="ios-person"></Icon>
            </span>
          </Input>
        </FormItem>
        <FormItem prop="password">
          <Input type="password" v-model="form.password" placeholder="Please input the password">
            <span slot="prepend">
              <Icon :size="14" type="md-lock"></Icon>
            </span>
          </Input>
        </FormItem>
        <FormItem>
          <Button @click="handleSubmit" type="primary" long>Login</Button>
        </FormItem>
        <FormItem>
          <Button @click="registerSwitch" type="primary" long>Register</Button>
        </FormItem>
      </Form>
    </div> 
    <div v-if="registerOn">
      <!-- <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80"> -->
      <Form ref="formValidate" :model="formValidate" :label-width="100">
        <FormItem label="E-mail:" prop="email">
            <Input v-model="formValidate.email" placeholder="Enter your e-mail">
              <span slot="prepend">
                <Icon :size="15" type="ios-mail"></Icon>
              </span>
            </Input>
        </FormItem>
        <FormItem label="Password:" prop="password">
            <Input v-model="formValidate.password" placeholder="Enter your password">
              <span slot="prepend">
                <Icon :size="14" type="md-lock"></Icon>
              </span>
            </Input>
        </FormItem>
        <FormItem label="User Name:" prop="name">
            <Input v-model="formValidate.name" placeholder="Enter your name">
              <span slot="prepend">
                <Icon :size="16" type="ios-person"></Icon>
              </span>
            </Input>
        </FormItem>
        <FormItem>
          <Button @click="registerInfoSubmit" type="primary" long>Register</Button>
        </FormItem>
        <FormItem>
          <Button @click="loginSwitch" type="primary" long>Login</Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapActions } from 'vuex'
export default {
  name: 'LoginForm',
  props: {
    userNameRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: 'User name cannot be empty', trigger: 'blur' }
        ]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: 'Password cannot be empty', trigger: 'blur' }
        ]
      }
    }
  },
  data () {
    return {
      registerOn: false, //xuyong
      form: {
        userName: '',
        password: ''
      },
      formValidate: {
        name: '',
        email: '',
        password: '',
      },
      ruleValidate: {
          email: [
              { required: true, message: 'Mailbox cannot be empty', trigger: 'blur' },
              { type: 'email', message: 'Incorrect email format', trigger: 'blur' }
          ],
          password: [
              { required: true, message: 'The pwd cannot be empty', trigger: 'blur' }
          ],
          name: [
              { required: true, message: 'The name cannot be empty', trigger: 'blur' }
          ],
      }
    }
  },
  computed: {
    rules () {
      return {
        userName: this.userNameRules,
        password: this.passwordRules
      }
    }
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit () {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
        axios
        .post('http://localhost:3000/test1', this.form)
        .then(res => {
          console.log("[START]Login: Receiving data from backend!!!!!")
          console.log(res.data)
          console.log("[END]Login: Receiving completed!!!!!")
          if (res.data.auth) {
            console.log("Login-form.vue page!!! DB match sucess!", this.form.userName, this.form.password)
            this.$emit('on-success-valid', {
              userName: this.form.userName,
              password: this.form.password
            })
          }
          else {
            this.$message.error("User name or password incorrect!")
          }
        })
        .catch(err => {
          console.log(err)
          this.$message.error("User name or password incorrect!")
        })
        }
      })
    },
    // //register done and enter home page directly
    // handleSubmit1 () {
    //   console.log("testtttt page!!!", this.formValidate.name, this.formValidate.password)
    //   this.$emit('on-success-valid', {
    //     userName: this.formValidate.name,
    //     password: this.formValidate.password
    //   })
    // },
    registerSwitch () {
      this.registerOn = true
    },
    loginSwitch () {
      this.registerOn = false
    },
    registerInfoSubmit () {
       console.log(this.formValidate.name)
       console.log(this.formValidate.email)
       console.log(this.formValidate.password)
       axios
        .post('http://localhost:3000/register', this.formValidate)
        .then(res => {
          console.log("[START]Receiving data from backend!!!!!")
          console.log(res)
          console.log("[END]Receiving completed!!!!!")
          this.registerOn = false
          return this.$Message.info('Registered Now!')
          // this.handleSubmit1()
        })
        .catch(err => {
          console.log(err)
        })
    },
  }
}
</script>
