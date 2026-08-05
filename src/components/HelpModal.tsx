"use client";

import { useState } from "react";

export default function HelpModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="underline hover:text-accent">
        使い方
      </button>

      {open && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-w-lg w-full max-h-[80vh] overflow-y-auto rounded-xl bg-paper border border-pencil/20 p-6 shadow-lg text-sm text-ink space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-hand">使い方</h2>
              <button onClick={() => setOpen(false)} className="text-pencil hover:text-ink">
                閉じる
              </button>
            </div>

            <section>
              <h3 className="font-medium mb-1">書き込む</h3>
              <p className="text-pencil">
                ページ上部の欄に文章を入力して「書き込む」を押すと、日時付きで一番上に追加されます。
              </p>
            </section>

            <section>
              <h3 className="font-medium mb-1">取り消したい部分に取り消し線を引く</h3>
              <p className="text-pencil">
                書いた文章の中で消したい部分をマウスでドラッグして選択すると、「選択した部分に取り消し線を引く」ボタンが出ます。押すと文字は消えずに取り消し線が引かれます。
              </p>
            </section>

            <section>
              <h3 className="font-medium mb-1">取り消した部分を書き直す</h3>
              <p className="text-pencil">
                取り消し線を引いた直後、その続きに書き直せる欄が出ます。ここに正しい内容を書いて「書き加える」を押すと、取り消し線のすぐ後ろに新しい文章が挿入されます。
              </p>
            </section>

            <section>
              <h3 className="font-medium mb-1">続きを書き足す</h3>
              <p className="text-pencil">
                「続きを書き足す」から、その投稿の一番最後に文章を追加できます。
              </p>
            </section>

            <section>
              <h3 className="font-medium mb-1">投稿を削除する</h3>
              <p className="text-pencil">
                投稿の右上の「削除」から投稿ごと削除できます。これは取り消し線と違い元に戻せないので、間違えて投稿したときなど用です。書いた内容の一部を直したいときは、削除ではなく取り消し線を使ってください。
              </p>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
