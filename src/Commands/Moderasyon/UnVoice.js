const Discord = require('discord.js');
const Utils = global.Utils;
const Settings = require('../../Configs/Settings.js');
const Ceza = require('../../Schemas/Ceza');
const table = require('table')

module.exports = {
    name: "unvmute",
    aliases: ['unvoicemute'],

    onLoad: function (client) {

    },

    onCommand: async function (client, message, args) {
        if (!Settings.muteHammer.some(perm => message.member.roles.cache.has(perm)) && !message.member.permissions.has(8)) return message.react(global.emojis.cross) && message.inlineReply(global.cevaplar.yetkiyok).then(x => x.delete({timeout: 6000})).catch(err => {});

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.react(global.emojis.cross) && message.inlineReply(global.cevaplar.üye).then(x => x.delete({timeout: 6000})).catch(err => {});
        if (member.user.id == message.author.id) return message.react(global.emojis.cross) && message.inlineReply(global.cevaplar.kendi).then(x => x.delete({timeout: 6000})).catch(err => {});
        if (message.member.roles.highest.position <= member.roles.highest.position) return message.react(global.emojis.cross) && message.inlineReply(global.cevaplar.yetkiust).then(x => x.delete({timeout: 6000}));

        let Mutes = await Utils.CezalariGetir(member) || [];
        Mutes = Mutes.filter(cezacik => cezacik.Aktif == true && cezacik.Tip == "Voice Mute");
        if (Mutes.length == 0) return message.react(global.emojis.cross) && message.inlineReply(`Hata: Bu kullanıcının davam eden bir ses susturması bulunmuyor.`).then(x => x.delete({timeout: 6000})).catch(err => {});

        for (mutes of Mutes) {
          const usr = message.guild.members.cache.get(mutes.userID);
          message.guild.unlog(usr, message.member, 'unvmute', 'mute-log', {ID: mutes.ID});
          await Ceza.findOneAndUpdate({ ID: mutes.ID }, { Aktif: false, Kaldiran: message.author.id });
        };

        await message.react(`${global.emojis.tick}`)
        if (member.voice && member.voice.channelID !== null) await member.voice.setMute(false);
        return message.inlineReply(`${global.emojis.tick} ${member} kişisinin sesli sohbet susturması başarılı bir şekilde kaldırıldı!`);
      }
};
