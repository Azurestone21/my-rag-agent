import { chatApi } from "./chat";
import { chunkApi } from "./chunk";
import { documentApi } from "./document";
import { knowledgeBaseApi } from "./knowledge-base";
import { searchApi } from "./search";
import { serviceCallApi } from "./service-call";

export const api = {
  knowledgeBase: knowledgeBaseApi,
  document: documentApi,
  chunk: chunkApi,
  search: searchApi,
  chat: chatApi,
  serviceCall: serviceCallApi,
};

export { request, toQuery } from "./request";
