<template>
  <div id="#app">
    <Row :gutter="20" style="margin-top: 10px;" type="flex">
      <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
        <videoView></videoView>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;" type="flex">
      <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
         <videoControl></videoControl>
      </i-col>
    </Row>
  </div>
</template>

<script>
import videoView from "../../components/video-cut/VideoView";
import videoControl from "../../components/video-cut/VideoControl";
export default {
  components:{
    videoView,
    videoControl
  }
}
</script>
<style lang="less">
    *{
      margin: 0;
      padding: 0;
    }
</style>