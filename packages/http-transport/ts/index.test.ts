import test from 'ava';
import fetch from 'node-fetch';

import parseRemoteRefs from "./parseRefsResponse";
import negotiatePack from "./negotiatePack";
import composeWantRequest from "./composeWantRequest";

test('fetch refs', async t => {
  const url = 'https://github.com/es-git/test-pull.git';
  const capabilites = new Map<string, string | boolean>();
  const remoteRefs = [...(await lsRemote(url, capabilites))].map(x => x.hash);
  console.log(remoteRefs);
  const localRefs : string[] = ['931935b3d196d0334bc144b2c79b0a9f2d978049'];
  for(const request of negotiatePack(remoteRefs, localRefs, remoteRefs)){
    const body = composeWantRequest(request, capabilites);
    await gitUploadPack(url, body);
    break;
  }
  t.pass();
});

async function lsRemote(url : string, capabilites : Map<string, string | boolean>){
  const service = 'git-upload-pack';
  const res = await fetch(`${url}/info/refs?service=${service}`);
  console.log('===lsRemote===');
  console.log(res.status, res.statusText);
  const refs = await res.text();
  return parseRemoteRefs(refs, service);
}

async function gitUploadPack(url : string, body : string){
  const service = 'git-upload-pack';
  console.log('===[gitUploadPack]===');
  const res = await fetch(`${url}/${service}`, {
    method: 'POST',
    headers: {
      'Content-Type': `application/x-${service}-request`,
      'Accept': `application/x-${service}-response`
    },
    body
  });
  console.log(res.status, res.statusText);
  const data = await res.text();
  console.log(data);
}